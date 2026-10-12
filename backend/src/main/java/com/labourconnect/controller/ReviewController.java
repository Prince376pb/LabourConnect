package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.ReviewCreateRequest;
import com.labourconnect.dto.ReviewDto;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ReviewCreateRequest request
    ) {
        ReviewDto dto = reviewService.createReview(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully.", dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getReviewsForUser(
        @PathVariable Long userId,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ReviewDto> reviews = reviewService.getReviewsForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }
}
