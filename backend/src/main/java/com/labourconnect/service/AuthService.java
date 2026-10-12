package com.labourconnect.service;

import com.labourconnect.dto.*;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.exception.UnauthorizedException;
import com.labourconnect.repository.*;
import com.labourconnect.security.JwtTokenProvider;
import com.labourconnect.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        WorkerProfileRepository workerProfileRepository,
        EmployerProfileRepository employerProfileRepository,
        CustomerProfileRepository customerProfileRepository,
        ProviderProfileRepository providerProfileRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtTokenProvider tokenProvider,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Enforce email uniqueness
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        // Enforce role restrictions: ROLE_ADMIN cannot be registered publicly
        String rawRole = request.getRole().trim().toUpperCase();
        final String roleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        if ("ROLE_ADMIN".equals(roleName)) {
            throw new BadRequestException("Unauthorized registration: Administrator accounts cannot be created via public registration.");
        }

        if (!roleName.equals("ROLE_EMPLOYER") && !roleName.equals("ROLE_WORKER") &&
            !roleName.equals("ROLE_CUSTOMER") && !roleName.equals("ROLE_PROVIDER")) {
            throw new BadRequestException("Invalid role selected. Valid roles are: EMPLOYER, WORKER, CUSTOMER, PROVIDER.");
        }

        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        // Create User
        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setActive(true);
        user.setSuspended(false);
        user.getRoles().add(role);

        User savedUser = userRepository.save(user);

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

        auditService.logEvent(savedUser, "REGISTER", "User", savedUser.getId(), "User registered as " + roleName, null);

        // Automatically authenticate and issue token
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserSummaryDto summary = mapToSummary(savedUser);

        return new AuthResponse(jwt, summary);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

            if (user.isSuspended()) {
                throw new UnauthorizedException("Account is suspended: " + 
                    (user.getSuspensionReason() != null ? user.getSuspensionReason() : "Please contact support."));
            }

            if (!user.isActive()) {
                throw new UnauthorizedException("Account has been deactivated.");
            }

            String jwt = tokenProvider.generateToken(authentication);
            UserSummaryDto summary = mapToSummary(user);

            return new AuthResponse(jwt, summary);
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email address or password.");
        }
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUserSummary(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToSummary(user);
    }

    public UserSummaryDto mapToSummary(User user) {
        Set<String> roleNames = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());

        return new UserSummaryDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhoneNumber(),
            roleNames,
            user.isActive(),
            user.isSuspended()
        );
    }
}
