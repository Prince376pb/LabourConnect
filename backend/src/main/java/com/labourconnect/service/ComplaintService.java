package com.labourconnect.service;

import com.labourconnect.dto.ComplaintCreateRequest;
import com.labourconnect.dto.ComplaintDto;
import com.labourconnect.dto.ComplaintResolveRequest;
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
import java.util.ArrayList;
import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final JobRepository jobRepository;
    private final AuditService auditService;

    public ComplaintService(
        ComplaintRepository complaintRepository,
        UserRepository userRepository,
        ServiceRequestRepository serviceRequestRepository,
        JobRepository jobRepository,
        AuditService auditService
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.jobRepository = jobRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ComplaintDto fileComplaint(Long complainantUserId, ComplaintCreateRequest request) {
        if (complainantUserId.equals(request.getReportedUserId())) {
            throw new BadRequestException("You cannot file a complaint against yourself.");
        }

        User complainant = userRepository.findById(complainantUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Complainant user not found"));
        User reportedUser = userRepository.findById(request.getReportedUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

        Complaint complaint = new Complaint();
        complaint.setComplainant(complainant);
        complaint.setReportedUser(reportedUser);
        complaint.setSubject(request.getSubject().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setStatus("PENDING");

        if (request.getServiceRequestId() != null) {
            ServiceRequest sr = serviceRequestRepository.findById(request.getServiceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));
            complaint.setServiceRequest(sr);
        }

        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
            complaint.setJob(job);
        }

        Complaint saved = complaintRepository.save(complaint);
        auditService.logEvent(complainant, "FILE_COMPLAINT", "Complaint", saved.getId(), "Complaint filed against " + reportedUser.getEmail(), null);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getUserComplaints(Long complainantUserId, Pageable pageable) {
        return complaintRepository.findByComplainantId(complainantUserId, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getAllComplaints(String status, String query, Pageable pageable) {
        Specification<Complaint> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Join<Complaint, User> compJoin = root.join("complainant", JoinType.LEFT);
                Join<Complaint, User> repJoin = root.join("reportedUser", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("subject")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(compJoin.get("fullName")), pattern),
                    cb.like(cb.lower(repJoin.get("fullName")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return complaintRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getAllComplaints(String status, Pageable pageable) {
        return getAllComplaints(status, null, pageable);
    }

    @Transactional
    public ComplaintDto resolveComplaint(Long adminUserId, Long complaintId, ComplaintResolveRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        complaint.setStatus(request.getStatus().toUpperCase());
        complaint.setAdminResolutionNotes(request.getAdminResolutionNotes());
        complaint.setResolvedByAdmin(admin);

        Complaint saved = complaintRepository.save(complaint);
        auditService.logEvent(admin, "RESOLVE_COMPLAINT", "Complaint", saved.getId(), "Complaint status set to " + saved.getStatus(), null);

        return mapToDto(saved);
    }

    public ComplaintDto mapToDto(Complaint c) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(c.getId());
        dto.setComplainantId(c.getComplainant().getId());
        dto.setComplainantName(c.getComplainant().getFullName());
        dto.setReportedUserId(c.getReportedUser().getId());
        dto.setReportedUserName(c.getReportedUser().getFullName());

        if (c.getServiceRequest() != null) {
            dto.setServiceRequestId(c.getServiceRequest().getId());
        }
        if (c.getJob() != null) {
            dto.setJobId(c.getJob().getId());
        }

        dto.setSubject(c.getSubject());
        dto.setDescription(c.getDescription());
        dto.setStatus(c.getStatus());
        dto.setAdminResolutionNotes(c.getAdminResolutionNotes());

        if (c.getResolvedByAdmin() != null) {
            dto.setResolvedByAdminId(c.getResolvedByAdmin().getId());
            dto.setResolvedByAdminName(c.getResolvedByAdmin().getFullName());
        }

        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
