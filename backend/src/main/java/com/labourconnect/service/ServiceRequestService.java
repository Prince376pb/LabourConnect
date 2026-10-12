package com.labourconnect.service;

import com.labourconnect.dto.*;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ForbiddenException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProfileService profileService;
    private final AuditService auditService;

    public ServiceRequestService(
        ServiceRequestRepository serviceRequestRepository,
        ProviderProfileRepository providerProfileRepository,
        CustomerProfileRepository customerProfileRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        ProfileService profileService,
        AuditService auditService
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.profileService = profileService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ProviderProfileDto> searchProviders(
        Long categoryId, String city, String query,
        Double userLat, Double userLng, Double maxRadiusKm,
        Pageable pageable
    ) {
        Specification<ProviderProfile> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("verificationStatus"), "APPROVED"));
            predicates.add(cb.isTrue(root.get("available")));
            if (categoryId != null) {
                Join<ProviderProfile, ServiceCategory> cats = root.join("categories", JoinType.LEFT);
                predicates.add(cb.equal(cats.get("id"), categoryId));
                q.distinct(true);
            }
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("businessName")), pattern));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ProviderProfile> rawProviders = providerProfileRepository.findAll(spec, pageable);

        List<ProviderProfileDto> dtos = rawProviders.getContent().stream()
            .map(profileService::mapProviderToDto)
            .peek(dto -> {
                if (userLat != null && userLng != null && dto.getLatitude() != null && dto.getLongitude() != null) {
                    double dist = calculateHaversineDistanceKm(userLat, userLng, dto.getLatitude(), dto.getLongitude());
                    dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                }
            })
            .filter(dto -> {
                if (maxRadiusKm != null && dto.getDistanceKm() != null) {
                    return dto.getDistanceKm() <= maxRadiusKm;
                }
                return true;
            })
            .sorted(Comparator.comparing(dto -> dto.getDistanceKm() != null ? dto.getDistanceKm() : Double.MAX_VALUE))
            .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, rawProviders.getTotalElements());
    }

    @Transactional
    public ServiceRequestDto createRequest(Long customerUserId, ServiceRequestCreateRequest request) {
        CustomerProfile customer = customerProfileRepository.findByUserId(customerUserId)
            .orElseThrow(() -> new BadRequestException("Customer profile required before submitting requests."));

        ProviderProfile provider = providerProfileRepository.findById(request.getProviderId())
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + request.getProviderId()));

        ServiceCategory category = serviceCategoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (!provider.isAvailable()) {
            throw new BadRequestException("This service provider is currently marked as unavailable.");
        }

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setCustomer(customer);
        serviceRequest.setProvider(provider);
        serviceRequest.setCategory(category);
        serviceRequest.setTitle(request.getTitle().trim());
        serviceRequest.setDescription(request.getDescription().trim());
        serviceRequest.setServiceAddress(request.getServiceAddress().trim());
        serviceRequest.setCity(request.getCity().trim());
        serviceRequest.setLatitude(request.getLatitude());
        serviceRequest.setLongitude(request.getLongitude());
        serviceRequest.setScheduledAt(request.getScheduledAt());
        serviceRequest.setEstimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : provider.getBaseRate());
        serviceRequest.setStatus("REQUESTED");

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        auditService.logEvent(customer.getUser(), "CREATE_SERVICE_REQUEST", "ServiceRequest", saved.getId(), "Service request created: " + saved.getTitle(), null);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequestDto> getCustomerRequests(Long customerUserId, String status, Long categoryId, String query, Pageable pageable) {
        CustomerProfile customer = customerProfileRepository.findByUserId(customerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

        Specification<ServiceRequest> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("customer").get("id"), customer.getId()));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<ServiceRequest, ProviderProfile> provJoin = root.join("provider", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(provJoin.get("businessName")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return serviceRequestRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequestDto> getCustomerRequests(Long customerUserId, Pageable pageable) {
        return getCustomerRequests(customerUserId, null, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequestDto> getProviderRequests(Long providerUserId, String status, Long categoryId, String query, Pageable pageable) {
        ProviderProfile provider = providerProfileRepository.findByUserId(providerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found."));

        Specification<ServiceRequest> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("provider").get("id"), provider.getId()));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<ServiceRequest, CustomerProfile> custJoin = root.join("customer", JoinType.LEFT);
                Join<CustomerProfile, User> userJoin = custJoin.join("user", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(userJoin.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return serviceRequestRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequestDto> getProviderRequests(Long providerUserId, Pageable pageable) {
        return getProviderRequests(providerUserId, null, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public ServiceRequestDto getRequestById(Long userId, Long requestId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        // Authorization check: Customer or Provider or Admin
        boolean isCustomer = req.getCustomer().getUser().getId().equals(userId);
        boolean isProvider = req.getProvider().getUser().getId().equals(userId);
        if (!isCustomer && !isProvider) {
            throw new ForbiddenException("Unauthorized: You do not have access to this service request.");
        }

        return mapToDto(req);
    }

    @Transactional
    public ServiceRequestDto updateStatus(Long providerUserId, Long requestId, ServiceStatusUpdateRequest update) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        if (!req.getProvider().getUser().getId().equals(providerUserId)) {
            throw new ForbiddenException("Unauthorized: You are not the assigned provider for this request.");
        }

        String currentStatus = req.getStatus();
        String nextStatus = update.getStatus().toUpperCase();

        // Enforce strict state machine transitions
        validateStateTransition(currentStatus, nextStatus);

        req.setStatus(nextStatus);
        if ("REJECTED".equals(nextStatus) && update.getReason() != null) {
            req.setRejectionReason(update.getReason());
        }
        if ("COMPLETED".equals(nextStatus) && update.getFinalCost() != null) {
            req.setFinalCost(update.getFinalCost());
        }

        ServiceRequest saved = serviceRequestRepository.save(req);
        auditService.logEvent(req.getProvider().getUser(), "UPDATE_SERVICE_STATUS", "ServiceRequest", saved.getId(), "Status changed to " + nextStatus, null);

        return mapToDto(saved);
    }

    @Transactional
    public ServiceRequestDto cancelRequest(Long customerUserId, Long requestId, String reason) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        if (!req.getCustomer().getUser().getId().equals(customerUserId)) {
            throw new ForbiddenException("Unauthorized: You can only cancel your own service requests.");
        }

        if (!"REQUESTED".equalsIgnoreCase(req.getStatus()) && !"ACCEPTED".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request cannot be cancelled once work is in progress (Current status: " + req.getStatus() + ").");
        }

        req.setStatus("CANCELLED");
        req.setCancellationReason(reason);

        ServiceRequest saved = serviceRequestRepository.save(req);
        auditService.logEvent(req.getCustomer().getUser(), "CANCEL_SERVICE_REQUEST", "ServiceRequest", saved.getId(), "Request cancelled by customer", null);

        return mapToDto(saved);
    }

    private void validateStateTransition(String from, String to) {
        boolean valid = switch (from) {
            case "REQUESTED" -> to.equals("ACCEPTED") || to.equals("REJECTED");
            case "ACCEPTED" -> to.equals("ON_THE_WAY") || to.equals("CANCELLED");
            case "ON_THE_WAY" -> to.equals("SERVICE_STARTED");
            case "SERVICE_STARTED" -> to.equals("COMPLETED");
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Illegal status transition from '" + from + "' to '" + to + "'.");
        }
    }

    private double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public ServiceRequestDto mapToDto(ServiceRequest req) {
        ServiceRequestDto dto = new ServiceRequestDto();
        dto.setId(req.getId());
        dto.setCustomerId(req.getCustomer().getId());
        dto.setCustomerUserId(req.getCustomer().getUser().getId());
        dto.setCustomerName(req.getCustomer().getUser().getFullName());
        dto.setCustomerPhone(req.getCustomer().getUser().getPhoneNumber());
        dto.setCustomerAddress(req.getCustomer().getAddress());

        dto.setProviderId(req.getProvider().getId());
        dto.setProviderUserId(req.getProvider().getUser().getId());
        dto.setProviderBusinessName(req.getProvider().getBusinessName());
        dto.setProviderPhone(req.getProvider().getUser().getPhoneNumber());
        dto.setProviderVerificationStatus(req.getProvider().getVerificationStatus());

        dto.setCategoryId(req.getCategory().getId());
        dto.setCategoryName(req.getCategory().getName());

        dto.setTitle(req.getTitle());
        dto.setDescription(req.getDescription());
        dto.setServiceAddress(req.getServiceAddress());
        dto.setCity(req.getCity());
        dto.setLatitude(req.getLatitude());
        dto.setLongitude(req.getLongitude());
        dto.setScheduledAt(req.getScheduledAt());
        dto.setEstimatedCost(req.getEstimatedCost());
        dto.setFinalCost(req.getFinalCost());
        dto.setStatus(req.getStatus());
        dto.setRejectionReason(req.getRejectionReason());
        dto.setCancellationReason(req.getCancellationReason());
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }
}
