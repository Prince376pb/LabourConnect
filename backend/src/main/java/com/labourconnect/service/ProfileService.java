package com.labourconnect.service;

import com.labourconnect.dto.*;
import com.labourconnect.entity.*;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final SkillRepository skillRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ProfileService(
        WorkerProfileRepository workerProfileRepository,
        EmployerProfileRepository employerProfileRepository,
        CustomerProfileRepository customerProfileRepository,
        ProviderProfileRepository providerProfileRepository,
        SkillRepository skillRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        ReviewRepository reviewRepository,
        UserRepository userRepository
    ) {
        this.workerProfileRepository = workerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.skillRepository = skillRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // --- WORKER PROFILE ---
    @Transactional(readOnly = true)
    public WorkerProfileDto getWorkerProfile(Long userId) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found for user: " + userId));
        return mapWorkerToDto(worker);
    }

    @Transactional
    public WorkerProfileDto updateWorkerProfile(Long userId, WorkerProfileDto dto) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                WorkerProfile newWorker = new WorkerProfile();
                newWorker.setUser(user);
                return newWorker;
            });

        worker.setHeadline(dto.getHeadline());
        worker.setBio(dto.getBio());
        worker.setYearsOfExperience(dto.getYearsOfExperience());
        worker.setDailyRate(dto.getDailyRate());
        worker.setHourlyRate(dto.getHourlyRate());
        worker.setCity(dto.getCity());
        worker.setArea(dto.getArea());
        worker.setLatitude(dto.getLatitude());
        worker.setLongitude(dto.getLongitude());
        if (dto.getAvailabilityStatus() != null) {
            worker.setAvailabilityStatus(dto.getAvailabilityStatus());
        }

        if (dto.getSkillIds() != null) {
            List<Skill> skills = skillRepository.findAllById(dto.getSkillIds());
            worker.setSkills(new HashSet<>(skills));
        }

        return mapWorkerToDto(workerProfileRepository.save(worker));
    }

    @Transactional(readOnly = true)
    public Page<WorkerProfileDto> searchWorkers(String city, String availability, Long skillId, String query, Pageable pageable) {
        Specification<WorkerProfile> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }
            if (availability != null && !availability.isBlank()) {
                predicates.add(cb.equal(root.get("availabilityStatus"), availability.trim()));
            }
            if (skillId != null) {
                Join<WorkerProfile, Skill> skills = root.join("skills", JoinType.LEFT);
                predicates.add(cb.equal(skills.get("id"), skillId));
                q.distinct(true);
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("headline")), pattern),
                    cb.like(cb.lower(root.get("user").get("fullName")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return workerProfileRepository.findAll(spec, pageable).map(this::mapWorkerToDto);
    }

    // --- EMPLOYER PROFILE ---
    @Transactional(readOnly = true)
    public EmployerProfileDto getEmployerProfile(Long userId) {
        EmployerProfile employer = employerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found for user: " + userId));
        return mapEmployerToDto(employer);
    }

    @Transactional
    public EmployerProfileDto updateEmployerProfile(Long userId, EmployerProfileDto dto) {
        EmployerProfile employer = employerProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                EmployerProfile newEmp = new EmployerProfile();
                newEmp.setUser(user);
                return newEmp;
            });

        employer.setCompanyName(dto.getCompanyName());
        if (dto.getBusinessType() != null) employer.setBusinessType(dto.getBusinessType());
        employer.setAddress(dto.getAddress());
        employer.setCity(dto.getCity());
        employer.setContactPerson(dto.getContactPerson());
        employer.setPhone(dto.getPhone());

        return mapEmployerToDto(employerProfileRepository.save(employer));
    }

    // --- CUSTOMER PROFILE ---
    @Transactional(readOnly = true)
    public CustomerProfileDto getCustomerProfile(Long userId) {
        CustomerProfile customer = customerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user: " + userId));
        return mapCustomerToDto(customer);
    }

    @Transactional
    public CustomerProfileDto updateCustomerProfile(Long userId, CustomerProfileDto dto) {
        CustomerProfile customer = customerProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                CustomerProfile newCust = new CustomerProfile();
                newCust.setUser(user);
                return newCust;
            });

        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setArea(dto.getArea());
        customer.setLatitude(dto.getLatitude());
        customer.setLongitude(dto.getLongitude());

        return mapCustomerToDto(customerProfileRepository.save(customer));
    }

    // --- PROVIDER PROFILE ---
    @Transactional(readOnly = true)
    public ProviderProfileDto getProviderProfile(Long userId) {
        ProviderProfile provider = providerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user: " + userId));
        return mapProviderToDto(provider);
    }

    @Transactional
    public ProviderProfileDto updateProviderProfile(Long userId, ProviderProfileDto dto) {
        ProviderProfile provider = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                ProviderProfile newProv = new ProviderProfile();
                newProv.setUser(user);
                return newProv;
            });

        provider.setBusinessName(dto.getBusinessName());
        provider.setBio(dto.getBio());
        provider.setYearsOfExperience(dto.getYearsOfExperience());
        provider.setBaseRate(dto.getBaseRate());
        provider.setHourlyRate(dto.getHourlyRate());
        provider.setCity(dto.getCity());
        if (dto.getServiceAreaRadiusKm() != null) {
            provider.setServiceAreaRadiusKm(dto.getServiceAreaRadiusKm());
        }
        provider.setLatitude(dto.getLatitude());
        provider.setLongitude(dto.getLongitude());
        provider.setAvailable(dto.isAvailable());

        if (dto.getCategoryIds() != null) {
            List<ServiceCategory> cats = serviceCategoryRepository.findAllById(dto.getCategoryIds());
            provider.setCategories(new HashSet<>(cats));
        }

        return mapProviderToDto(providerProfileRepository.save(provider));
    }

    // --- MAPPERS ---
    public WorkerProfileDto mapWorkerToDto(WorkerProfile w) {
        WorkerProfileDto dto = new WorkerProfileDto();
        dto.setId(w.getId());
        dto.setUserId(w.getUser().getId());
        dto.setFullName(w.getUser().getFullName());
        dto.setEmail(w.getUser().getEmail());
        dto.setPhone(w.getUser().getPhoneNumber());
        dto.setHeadline(w.getHeadline());
        dto.setBio(w.getBio());
        dto.setYearsOfExperience(w.getYearsOfExperience());
        dto.setDailyRate(w.getDailyRate());
        dto.setHourlyRate(w.getHourlyRate());
        dto.setCity(w.getCity());
        dto.setArea(w.getArea());
        dto.setLatitude(w.getLatitude());
        dto.setLongitude(w.getLongitude());
        dto.setAvailabilityStatus(w.getAvailabilityStatus());

        Set<Long> sIds = w.getSkills().stream().map(Skill::getId).collect(Collectors.toSet());
        Set<String> sNames = w.getSkills().stream().map(Skill::getName).collect(Collectors.toSet());
        dto.setSkillIds(sIds);
        dto.setSkillNames(sNames);

        dto.setAverageRating(reviewRepository.getAverageRatingForUser(w.getUser().getId()));
        dto.setReviewCount(reviewRepository.getReviewCountForUser(w.getUser().getId()));
        return dto;
    }

    public EmployerProfileDto mapEmployerToDto(EmployerProfile e) {
        EmployerProfileDto dto = new EmployerProfileDto();
        dto.setId(e.getId());
        dto.setUserId(e.getUser().getId());
        dto.setCompanyName(e.getCompanyName());
        dto.setBusinessType(e.getBusinessType());
        dto.setAddress(e.getAddress());
        dto.setCity(e.getCity());
        dto.setContactPerson(e.getContactPerson());
        dto.setPhone(e.getPhone());
        dto.setEmail(e.getUser().getEmail());
        dto.setAverageRating(reviewRepository.getAverageRatingForUser(e.getUser().getId()));
        dto.setReviewCount(reviewRepository.getReviewCountForUser(e.getUser().getId()));
        return dto;
    }

    public CustomerProfileDto mapCustomerToDto(CustomerProfile c) {
        CustomerProfileDto dto = new CustomerProfileDto();
        dto.setId(c.getId());
        dto.setUserId(c.getUser().getId());
        dto.setFullName(c.getUser().getFullName());
        dto.setEmail(c.getUser().getEmail());
        dto.setPhone(c.getUser().getPhoneNumber());
        dto.setAddress(c.getAddress());
        dto.setCity(c.getCity());
        dto.setArea(c.getArea());
        dto.setLatitude(c.getLatitude());
        dto.setLongitude(c.getLongitude());
        return dto;
    }

    public ProviderProfileDto mapProviderToDto(ProviderProfile p) {
        ProviderProfileDto dto = new ProviderProfileDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setFullName(p.getUser().getFullName());
        dto.setEmail(p.getUser().getEmail());
        dto.setPhone(p.getUser().getPhoneNumber());
        dto.setBusinessName(p.getBusinessName());
        dto.setBio(p.getBio());
        dto.setYearsOfExperience(p.getYearsOfExperience());
        dto.setBaseRate(p.getBaseRate());
        dto.setHourlyRate(p.getHourlyRate());
        dto.setCity(p.getCity());
        dto.setServiceAreaRadiusKm(p.getServiceAreaRadiusKm());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setVerificationStatus(p.getVerificationStatus());
        dto.setVerificationNotes(p.getVerificationNotes());
        dto.setIdProofUrl(p.getIdProofUrl());
        dto.setVerifiedAt(p.getVerifiedAt());
        dto.setAvailable(p.isAvailable());

        Set<Long> cIds = p.getCategories().stream().map(ServiceCategory::getId).collect(Collectors.toSet());
        Set<String> cNames = p.getCategories().stream().map(ServiceCategory::getName).collect(Collectors.toSet());
        dto.setCategoryIds(cIds);
        dto.setCategoryNames(cNames);

        dto.setAverageRating(reviewRepository.getAverageRatingForUser(p.getUser().getId()));
        dto.setReviewCount(reviewRepository.getReviewCountForUser(p.getUser().getId()));
        return dto;
    }
}
