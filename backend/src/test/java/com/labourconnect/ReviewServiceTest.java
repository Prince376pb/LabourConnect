package com.labourconnect;

import com.labourconnect.dto.*;
import com.labourconnect.entity.Role;
import com.labourconnect.entity.ServiceCategory;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.repository.RoleRepository;
import com.labourconnect.repository.ServiceCategoryRepository;
import com.labourconnect.service.AuthService;
import com.labourconnect.service.ProfileService;
import com.labourconnect.service.ReviewService;
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
public class ReviewServiceTest {

    @Autowired
    private ReviewService reviewService;

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

        AuthResponse custResp = authService.register(new RegisterRequest("custrev@test.com", "Pass@123", "Customer Reviewer", "+91-9988110011", "CUSTOMER"));
        customerUserId = custResp.getUser().getId();

        AuthResponse provResp = authService.register(new RegisterRequest("provrev@test.com", "Pass@123", "Provider Reviewee", "+91-9988110012", "PROVIDER"));
        providerUserId = provResp.getUser().getId();

        ProviderProfileDto provProfile = profileService.getProviderProfile(providerUserId);
        providerProfileId = provProfile.getId();

        ServiceCategory cat = new ServiceCategory();
        cat.setName("Electrical");
        cat.setSlug("electrical-test");
        cat.setIconName("Zap");
        cat.setActive(true);
        ServiceCategory savedCat = categoryRepository.save(cat);
        categoryId = savedCat.getId();
    }

    @Test
    @DisplayName("Customer can review provider only after service completion; duplicate reviews blocked")
    void testReviewWorkflowAndDuplicateBlock() {
        ServiceRequestCreateRequest req = new ServiceRequestCreateRequest();
        req.setProviderId(providerProfileId);
        req.setCategoryId(categoryId);
        req.setTitle("Ceiling Fan Sparking");
        req.setDescription("Fan sparks when turned on.");
        req.setServiceAddress("Block B, Indiranagar");
        req.setCity("Bangalore");
        req.setEstimatedCost(new BigDecimal("300.00"));

        ServiceRequestDto requestDto = serviceRequestService.createRequest(customerUserId, req);

        // Attempting to review while REQUESTED must fail
        ReviewCreateRequest prematureReview = new ReviewCreateRequest();
        prematureReview.setRevieweeId(providerUserId);
        prematureReview.setServiceRequestId(requestDto.getId());
        prematureReview.setRating(5);
        prematureReview.setReviewText("Great work!");

        assertThrows(BadRequestException.class, () -> reviewService.createReview(customerUserId, prematureReview));

        // Advance to COMPLETED
        serviceRequestService.updateStatus(providerUserId, requestDto.getId(), new ServiceStatusUpdateRequest("ACCEPTED"));
        serviceRequestService.updateStatus(providerUserId, requestDto.getId(), new ServiceStatusUpdateRequest("ON_THE_WAY"));
        serviceRequestService.updateStatus(providerUserId, requestDto.getId(), new ServiceStatusUpdateRequest("SERVICE_STARTED"));
        serviceRequestService.updateStatus(providerUserId, requestDto.getId(), new ServiceStatusUpdateRequest("COMPLETED"));

        // Now review succeeds
        ReviewDto submitted = reviewService.createReview(customerUserId, prematureReview);
        assertNotNull(submitted);
        assertEquals(5, submitted.getRating());

        // Subsequent attempt to review same interaction must fail
        assertThrows(BadRequestException.class, () -> reviewService.createReview(customerUserId, prematureReview));
    }
}
