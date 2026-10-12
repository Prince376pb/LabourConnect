package com.labourconnect.service;

import com.labourconnect.dto.*;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;
    private final ProfileService profileService;
    private final AuditService auditService;

    public AdminService(
        UserRepository userRepository,
        JobRepository jobRepository,
        ServiceRequestRepository serviceRequestRepository,
        ProviderProfileRepository providerProfileRepository,
        ComplaintRepository complaintRepository,
        AuditLogRepository auditLogRepository,
        AuthService authService,
        ProfileService profileService,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
        this.profileService = profileService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getPlatformStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByActiveTrue());
        stats.setSuspendedUsers(userRepository.countBySuspendedTrue());
        stats.setTotalJobs(jobRepository.count());
        stats.setOpenJobs(jobRepository.countByStatus("OPEN"));
        stats.setTotalServiceRequests(serviceRequestRepository.count());
        stats.setCompletedServiceRequests(serviceRequestRepository.countByStatus("COMPLETED"));
        stats.setPendingVerifications(providerProfileRepository.countByVerificationStatus("PENDING"));
        stats.setPendingComplaints(complaintRepository.countByStatus("PENDING"));
        return stats;
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listUsers(String role, String status, String query, Pageable pageable) {
        Specification<User> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
                String cleanRole = role.trim().toUpperCase();
                String roleName = cleanRole.startsWith("ROLE_") ? cleanRole : "ROLE_" + cleanRole;
                Join<User, Role> roleJoin = root.join("roles", JoinType.INNER);
                predicates.add(cb.equal(roleJoin.get("name"), roleName));
                q.distinct(true);
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                String st = status.trim().toUpperCase();
                if ("ACTIVE".equals(st)) {
                    predicates.add(cb.and(cb.isTrue(root.get("active")), cb.isFalse(root.get("suspended"))));
                } else if ("SUSPENDED".equals(st)) {
                    predicates.add(cb.isTrue(root.get("suspended")));
                } else if ("INACTIVE".equals(st) || "DEACTIVATED".equals(st)) {
                    predicates.add(cb.isFalse(root.get("active")));
                }
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phoneNumber")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable).map(authService::mapToSummary);
    }

    @Transactional
    public UserSummaryDto updateUserStatus(Long adminUserId, Long targetUserId, UserStatusUpdateRequest request) {
        if (adminUserId.equals(targetUserId)) {
            throw new BadRequestException("Administrators cannot suspend their own administrative account.");
        }

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        targetUser.setSuspended(request.getSuspended());
        if (Boolean.TRUE.equals(request.getSuspended())) {
            targetUser.setSuspensionReason(request.getSuspensionReason());
        } else {
            targetUser.setSuspensionReason(null);
        }

        User saved = userRepository.save(targetUser);
        auditService.logEvent(
            admin,
            request.getSuspended() ? "SUSPEND_USER" : "REACTIVATE_USER",
            "User",
            saved.getId(),
            "User suspension updated: " + request.getSuspended(),
            null
        );

        return authService.mapToSummary(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProviderProfileDto> getPendingVerifications(Pageable pageable) {
        return getVerifications("PENDING", null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<ProviderProfileDto> getVerifications(String status, Long categoryId, String query, Pageable pageable) {
        Specification<ProviderProfile> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("verificationStatus"), status.trim().toUpperCase()));
            }

            if (categoryId != null) {
                Join<ProviderProfile, ServiceCategory> cats = root.join("categories", JoinType.LEFT);
                predicates.add(cb.equal(cats.get("id"), categoryId));
                q.distinct(true);
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<ProviderProfile, User> userJoin = root.join("user", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("businessName")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern),
                    cb.like(cb.lower(userJoin.get("fullName")), pattern),
                    cb.like(cb.lower(userJoin.get("email")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return providerProfileRepository.findAll(spec, pageable).map(profileService::mapProviderToDto);
    }

    @Transactional
    public ProviderProfileDto decideVerification(Long adminUserId, Long providerId, VerificationDecisionRequest request) {
        ProviderProfile provider = providerProfileRepository.findById(providerId)
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));

        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        String status = request.getStatus().toUpperCase();
        provider.setVerificationStatus(status);
        provider.setVerificationNotes(request.getNotes());

        if ("APPROVED".equals(status)) {
            provider.setVerifiedAt(Instant.now());
        } else {
            provider.setVerifiedAt(null);
        }

        ProviderProfile saved = providerProfileRepository.save(provider);
        auditService.logEvent(admin, "DECIDE_VERIFICATION", "ProviderProfile", saved.getId(), "Verification set to " + status, null);

        return profileService.mapProviderToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(String action, String query, Pageable pageable) {
        Specification<AuditLog> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (action != null && !action.isBlank() && !"ALL".equalsIgnoreCase(action)) {
                predicates.add(cb.equal(root.get("action"), action.trim()));
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("details")), pattern),
                    cb.like(cb.lower(root.get("entityName")), pattern),
                    cb.like(cb.lower(root.get("ipAddress")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable);
    }
}
