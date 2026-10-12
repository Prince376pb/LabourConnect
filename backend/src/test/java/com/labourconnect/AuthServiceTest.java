package com.labourconnect;

import com.labourconnect.dto.AuthResponse;
import com.labourconnect.dto.RegisterRequest;
import com.labourconnect.entity.Role;
import com.labourconnect.entity.User;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.repository.RoleRepository;
import com.labourconnect.repository.UserRepository;
import com.labourconnect.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        if (!roleRepository.existsByName("ROLE_WORKER")) {
            roleRepository.save(new Role("ROLE_WORKER"));
        }
        if (!roleRepository.existsByName("ROLE_EMPLOYER")) {
            roleRepository.save(new Role("ROLE_EMPLOYER"));
        }
        if (!roleRepository.existsByName("ROLE_CUSTOMER")) {
            roleRepository.save(new Role("ROLE_CUSTOMER"));
        }
        if (!roleRepository.existsByName("ROLE_PROVIDER")) {
            roleRepository.save(new Role("ROLE_PROVIDER"));
        }
    }

    @Test
    @DisplayName("Worker registration succeeds with encrypted password and correct role")
    void testRegisterWorkerSuccess() {
        RegisterRequest req = new RegisterRequest(
            "newworker@test.com",
            "StrongPass@123",
            "Ravi Kumar",
            "+91-9876543210",
            "WORKER"
        );

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertEquals("newworker@test.com", response.getUser().getEmail());
        assertTrue(response.getUser().getRoles().contains("ROLE_WORKER"));

        User saved = userRepository.findByEmail("newworker@test.com").orElse(null);
        assertNotNull(saved);
        assertTrue(passwordEncoder.matches("StrongPass@123", saved.getPasswordHash()));
    }

    @Test
    @DisplayName("Public registration with ROLE_ADMIN is strictly prohibited")
    void testRegisterAdminRejected() {
        RegisterRequest req = new RegisterRequest(
            "badactor@test.com",
            "AttackPass@123",
            "Bad Actor",
            "+91-9876543210",
            "ROLE_ADMIN"
        );

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("Duplicate email registration throws BadRequestException")
    void testDuplicateEmailRegistration() {
        RegisterRequest req1 = new RegisterRequest(
            "duplicate@test.com",
            "Password@123",
            "User One",
            "+91-9876543210",
            "CUSTOMER"
        );
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest(
            "duplicate@test.com",
            "Password@456",
            "User Two",
            "+91-9876543211",
            "CUSTOMER"
        );

        assertThrows(BadRequestException.class, () -> authService.register(req2));
    }
}
