package com.labourconnect.service;

import com.labourconnect.dto.ReviewCreateRequest;
import com.labourconnect.dto.ReviewDto;
import com.labourconnect.entity.*;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final AuditService auditService;

    public ReviewService(
        ReviewRepository reviewRepository,
        UserRepository userRepository,
        JobRepository jobRepository,
        ServiceRequestRepository serviceRequestRepository,
        AuditService auditService
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ReviewDto createReview(Long reviewerUserId, ReviewCreateRequest request) {
        if (reviewerUserId.equals(request.getRevieweeId())) {
            throw new BadRequestException("Self-reviews are not permitted.");
        }

        User reviewer = userRepository.findById(reviewerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        User reviewee = userRepository.findById(request.getRevieweeId())
            .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));

            if (reviewRepository.existsByReviewerIdAndJobId(reviewerUserId, job.getId())) {
                throw new BadRequestException("You have already submitted a review for this employment engagement.");
            }

            review.setJob(job);
        } else if (request.getServiceRequestId() != null) {
            ServiceRequest sr = serviceRequestRepository.findById(request.getServiceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + request.getServiceRequestId()));

            if (!"COMPLETED".equalsIgnoreCase(sr.getStatus())) {
                throw new BadRequestException("Reviews can only be submitted for completed service requests.");
            }

            if (reviewRepository.existsByReviewerIdAndServiceRequestId(reviewerUserId, sr.getId())) {
                throw new BadRequestException("You have already submitted a review for this service transaction.");
            }

            review.setServiceRequest(sr);
        } else {
            throw new BadRequestException("Review must be associated with either an eligible Job or Service Request.");
        }

        Review saved = reviewRepository.save(review);
        auditService.logEvent(reviewer, "CREATE_REVIEW", "Review", saved.getId(), "Review submitted for user " + reviewee.getEmail(), null);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsForUser(Long userId, Pageable pageable) {
        return reviewRepository.findByRevieweeId(userId, pageable)
            .map(this::mapToDto);
    }

    public ReviewDto mapToDto(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        dto.setReviewerId(r.getReviewer().getId());
        dto.setReviewerName(r.getReviewer().getFullName());
        dto.setRevieweeId(r.getReviewee().getId());
        dto.setRevieweeName(r.getReviewee().getFullName());

        if (r.getJob() != null) {
            dto.setJobId(r.getJob().getId());
            dto.setJobTitle(r.getJob().getTitle());
        }

        if (r.getServiceRequest() != null) {
            dto.setServiceRequestId(r.getServiceRequest().getId());
            dto.setServiceTitle(r.getServiceRequest().getTitle());
        }

        dto.setRating(r.getRating());
        dto.setReviewText(r.getReviewText());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
