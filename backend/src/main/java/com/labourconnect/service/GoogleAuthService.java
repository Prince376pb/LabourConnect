package com.labourconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.labourconnect.dto.GoogleAuthRequest;
import com.labourconnect.dto.GoogleAuthResponse;
import com.labourconnect.dto.UserSummaryDto;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.exception.UnauthorizedException;
import com.labourconnect.repository.*;
import com.labourconnect.security.JwtTokenProvider;
import com.labourconnect.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;
    private final AuthService authService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.google.client-id:}")
    private String configuredGoogleClientId;

    @PostConstruct
    public void init() {
        boolean present = configuredGoogleClientId != null && !configuredGoogleClientId.trim().isEmpty();
        boolean validFormat = present && configuredGoogleClientId.trim().endsWith(".apps.googleusercontent.com");
        log.info("[Google Auth Diagnostic] Backend Google Client ID configured: {}, Valid format: {}", present, validFormat);
    }

    public GoogleAuthService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        WorkerProfileRepository workerProfileRepository,
        EmployerProfileRepository employerProfileRepository,
        CustomerProfileRepository customerProfileRepository,
        ProviderProfileRepository providerProfileRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider tokenProvider,
        AuditService auditService,
        AuthService authService,
        RestTemplate restTemplate,
        ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
        this.authService = authService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GoogleAuthResponse authenticateGoogle(GoogleAuthRequest request) {
        if (request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            throw new BadRequestException("Google ID token is required.");
        }

        // Verify token with Google's secure tokeninfo service
        VerifiedGooglePayload payload = verifyGoogleIdToken(request.getIdToken().trim());

        String email = payload.email.trim().toLowerCase();
        String name = request.getFullName() != null && !request.getFullName().isBlank()
            ? request.getFullName().trim()
            : (payload.name != null && !payload.name.isBlank() ? payload.name.trim() : email.split("@")[0]);

        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();

            if (user.isSuspended()) {
                throw new UnauthorizedException("Account is suspended: " +
                    (user.getSuspensionReason() != null ? user.getSuspensionReason() : "Please contact support."));
            }

            if (!user.isActive()) {
                throw new UnauthorizedException("Account has been deactivated.");
            }

            UserPrincipal userPrincipal = UserPrincipal.create(user);
            String jwt = tokenProvider.generateTokenFromUser(userPrincipal);
            UserSummaryDto summary = authService.mapToSummary(user);

            auditService.logEvent(user, "GOOGLE_LOGIN", "User", user.getId(), "User logged in with Google account", null);
            return GoogleAuthResponse.authenticated(jwt, summary, "Logged in with Google successfully.");
        }

        // New user - check if role & required details are provided
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            return GoogleAuthResponse.needsRegistration(
                email,
                name,
                "New Google user. Please complete role selection and phone number to finish registration."
            );
        }

        // Validate selected role
        String rawRole = request.getRole().trim().toUpperCase();
        String roleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        if ("ROLE_ADMIN".equals(roleName)) {
            throw new BadRequestException("Unauthorized registration: Administrator accounts cannot be created via public registration.");
        }

        if (!roleName.equals("ROLE_EMPLOYER") && !roleName.equals("ROLE_WORKER") &&
            !roleName.equals("ROLE_CUSTOMER") && !roleName.equals("ROLE_PROVIDER")) {
            throw new BadRequestException("Invalid role selected. Valid roles are: EMPLOYER, WORKER, CUSTOMER, PROVIDER.");
        }

        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new BadRequestException("Phone number is required to complete registration.");
        }

        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        // Create new User entity
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setPhoneNumber(request.getPhoneNumber().trim());
        // Random secure password hash so direct email/password login is not compromised without password reset
        newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setActive(true);
        newUser.setSuspended(false);
        newUser.getRoles().add(role);

        User savedUser = userRepository.save(newUser);

        // Provision initial profile record matching the role
        switch (roleName) {
            case "ROLE_WORKER" -> {
                WorkerProfile worker = new WorkerProfile();
                worker.setUser(savedUser);
                worker.setHeadline("Skilled Worker");
                worker.setAvailabilityStatus("AVAILABLE");
                workerProfileRepository.save(worker);
            }
            case "ROLE_EMPLOYER" -> {
                EmployerProfile employer = new EmployerProfile();
                employer.setUser(savedUser);
                employer.setCompanyName(savedUser.getFullName() + "'s Business");
                employer.setContactPerson(savedUser.getFullName());
                employer.setPhone(savedUser.getPhoneNumber());
                employerProfileRepository.save(employer);
            }
            case "ROLE_CUSTOMER" -> {
                CustomerProfile customer = new CustomerProfile();
                customer.setUser(savedUser);
                customerProfileRepository.save(customer);
            }
            case "ROLE_PROVIDER" -> {
                ProviderProfile provider = new ProviderProfile();
                provider.setUser(savedUser);
                provider.setBusinessName(savedUser.getFullName() + " Services");
                provider.setVerificationStatus("PENDING");
                provider.setAvailable(true);
                providerProfileRepository.save(provider);
            }
        }

        auditService.logEvent(savedUser, "GOOGLE_REGISTER", "User", savedUser.getId(), "User registered via Google as " + roleName, null);

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUser(userPrincipal);
        UserSummaryDto summary = authService.mapToSummary(savedUser);

        return GoogleAuthResponse.authenticated(jwt, summary, "Account created successfully with Google! Welcome to Labour Connect.");
    }

    private VerifiedGooglePayload verifyGoogleIdToken(String idToken) {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                GOOGLE_TOKENINFO_URL + idToken,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new UnauthorizedException("Google authentication failed: Invalid token response from Google.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());

            if (root.has("error")) {
                String errorDesc = root.has("error_description") ? root.get("error_description").asText() : root.get("error").asText();
                throw new UnauthorizedException("Invalid Google token: " + errorDesc);
            }

            String email = root.has("email") ? root.get("email").asText() : null;
            if (email == null || email.isBlank()) {
                throw new UnauthorizedException("Google ID token did not contain an email address.");
            }

            // Verify email_verified is true
            boolean emailVerified = root.has("email_verified") &&
                (root.get("email_verified").asBoolean() || "true".equalsIgnoreCase(root.get("email_verified").asText()));
            if (!emailVerified) {
                throw new UnauthorizedException("The email associated with this Google account is not verified by Google.");
            }

            // If configuredGoogleClientId is set, verify audience matches
            if (configuredGoogleClientId != null && !configuredGoogleClientId.trim().isEmpty()) {
                String aud = root.has("aud") ? root.get("aud").asText() : "";
                if (!configuredGoogleClientId.trim().equals(aud)) {
                    log.warn("Google token aud '{}' does not match configured client id '{}'", aud, configuredGoogleClientId);
                    throw new UnauthorizedException("Google token audience mismatch. Please check OAuth Client ID configuration.");
                }
            }

            String name = root.has("name") ? root.get("name").asText() : null;
            String sub = root.has("sub") ? root.get("sub").asText() : null;

            return new VerifiedGooglePayload(email, name, sub);

        } catch (HttpStatusCodeException ex) {
            log.error("Google token verification failed with HTTP status: {}", ex.getStatusCode());
            throw new UnauthorizedException("Google authentication failed. The token is invalid or expired.");
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error verifying Google ID token", ex);
            throw new UnauthorizedException("Unable to verify Google credentials. Please try again or use email sign-in.");
        }
    }

    private static class VerifiedGooglePayload {
        final String email;
        final String name;
        final String sub;

        VerifiedGooglePayload(String email, String name, String sub) {
            this.email = email;
            this.name = name;
            this.sub = sub;
        }
    }
}
