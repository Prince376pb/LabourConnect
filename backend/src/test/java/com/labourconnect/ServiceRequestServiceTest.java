package com.labourconnect;

import com.labourconnect.dto.*;
import com.labourconnect.entity.Role;
import com.labourconnect.entity.ServiceCategory;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ForbiddenException;
import com.labourconnect.repository.RoleRepository;
import com.labourconnect.repository.ServiceCategoryRepository;
import com.labourconnect.service.AuthService;
import com.labourconnect.service.ProfileService;
import com.labourconnect.service.ServiceRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ServiceRequestServiceTest {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    private Long customerUserId;
    private Long providerUserId;
    private Long providerProfileId;
    private Long categoryId;

    @BeforeEach
    void setUp() {
        if (!roleRepository.existsByName("ROLE_CUSTOMER")) roleRepository.save(new Role("ROLE_CUSTOMER"));
        if (!roleRepository.existsByName("ROLE_PROVIDER")) roleRepository.save(new Role("ROLE_PROVIDER"));

        AuthResponse custResp = authService.register(new RegisterRequest("cust1@test.com", "Pass@123", "Customer One", "+91-9988112233", "CUSTOMER"));
        customerUserId = custResp.getUser().getId();

        AuthResponse provResp = authService.register(new RegisterRequest("prov1@test.com", "Pass@123", "Provider One", "+91-9988112234", "PROVIDER"));
        providerUserId = provResp.getUser().getId();

        ProviderProfileDto provProfile = profileService.getProviderProfile(providerUserId);
        providerProfileId = provProfile.getId();

        ServiceCategory cat = new ServiceCategory();
        cat.setName("Plumbing");
        cat.setSlug("plumbing-test");
        cat.setIconName("Wrench");
        cat.setActive(true);
        ServiceCategory savedCat = categoryRepository.save(cat);
        categoryId = savedCat.getId();
    }

    @Test
    @DisplayName("Complete service request state lifecycle transitions succeed")
    void testServiceRequestLifecycleTransitions() {
        ServiceRequestCreateRequest req = new ServiceRequestCreateRequest();
        req.setProviderId(providerProfileId);
        req.setCategoryId(categoryId);
        req.setTitle("Kitchen Sink Leak");
        req.setDescription("Water leaking continuously under the kitchen sink.");
        req.setServiceAddress("Flat 101, Lake View Apts");
        req.setCity("Bangalore");
        req.setEstimatedCost(new BigDecimal("400.00"));

        ServiceRequestDto created = serviceRequestService.createRequest(customerUserId, req);
        assertEquals("REQUESTED", created.getStatus());

        // 1. Provider Accepts
        ServiceRequestDto accepted = serviceRequestService.updateStatus(providerUserId, created.getId(), new ServiceStatusUpdateRequest("ACCEPTED"));
        assertEquals("ACCEPTED", accepted.getStatus());

        // 2. Provider is On The Way
        ServiceRequestDto onWay = serviceRequestService.updateStatus(providerUserId, created.getId(), new ServiceStatusUpdateRequest("ON_THE_WAY"));
        assertEquals("ON_THE_WAY", onWay.getStatus());

        // 3. Provider Starts Work
        ServiceRequestDto started = serviceRequestService.updateStatus(providerUserId, created.getId(), new ServiceStatusUpdateRequest("SERVICE_STARTED"));
        assertEquals("SERVICE_STARTED", started.getStatus());

        // 4. Provider Completes Service
        ServiceStatusUpdateRequest completeReq = new ServiceStatusUpdateRequest("COMPLETED");
        completeReq.setFinalCost(new BigDecimal("450.00"));
        ServiceRequestDto completed = serviceRequestService.updateStatus(providerUserId, created.getId(), completeReq);
        assertEquals("COMPLETED", completed.getStatus());
        assertEquals(new BigDecimal("450.00"), completed.getFinalCost());
    }

    @Test
    @DisplayName("Illegal transition directly from REQUESTED to SERVICE_STARTED is blocked")
    void testIllegalTransitionBlocked() {
        ServiceRequestCreateRequest req = new ServiceRequestCreateRequest();
        req.setProviderId(providerProfileId);
        req.setCategoryId(categoryId);
        req.setTitle("Bathroom Tap Leak");
        req.setDescription("Tap replacement needed.");
        req.setServiceAddress("House 12");
        req.setCity("Bangalore");

        ServiceRequestDto created = serviceRequestService.createRequest(customerUserId, req);

        // Attempting to jump directly to SERVICE_STARTED without ACCEPTED must throw BadRequestException
        assertThrows(BadRequestException.class, () ->
            serviceRequestService.updateStatus(providerUserId, created.getId(), new ServiceStatusUpdateRequest("SERVICE_STARTED"))
        );
    }
}
