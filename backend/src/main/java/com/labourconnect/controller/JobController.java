package com.labourconnect.controller;

import com.labourconnect.dto.*;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobDto>> createJob(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody JobCreateRequest request
    ) {
        JobDto job = jobService.createJob(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Job posted successfully.", job));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobDto>> updateJob(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody JobCreateRequest request
    ) {
        JobDto job = jobService.updateJob(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Job updated successfully.", job));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobDto>> closeJob(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        JobDto job = jobService.closeJob(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Job closed successfully.", job));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobDto>>> searchJobs(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "city", required = false) String city,
        @RequestParam(value = "jobType", required = false) String jobType,
        @RequestParam(value = "skillId", required = false) Long skillId,
        @RequestParam(value = "minWage", required = false) BigDecimal minWage,
        @RequestParam(value = "maxWage", required = false) BigDecimal maxWage,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<JobDto> jobs = jobService.searchJobs(status, city, jobType, skillId, minWage, maxWage, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @GetMapping({"/my-jobs", "/my"})
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Page<JobDto>>> getEmployerJobs(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "city", required = false) String city,
        @RequestParam(value = "jobType", required = false) String jobType,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<JobDto> jobs = jobService.getEmployerJobs(principal.getId(), status, city, jobType, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJobById(id)));
    }

    // --- APPLICATION ENDPOINTS ---
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> applyForJob(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestBody JobApplicationCreateRequest request
    ) {
        JobApplicationDto app = jobService.applyForJob(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Application submitted successfully.", app));
    }

    @GetMapping("/{id}/applications")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Page<JobApplicationDto>>> getJobApplications(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<JobApplicationDto> applications = jobService.getJobApplications(principal.getId(), id, status, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @GetMapping("/applications/my-applications")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<Page<JobApplicationDto>>> getMyApplications(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<JobApplicationDto> applications = jobService.getWorkerApplications(principal.getId(), status, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateApplicationStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        JobApplicationDto app = jobService.updateApplicationStatus(principal.getId(), id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Applicant status updated.", app));
    }

    @PostMapping("/applications/{id}/withdraw")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<String>> withdrawApplication(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        jobService.withdrawApplication(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn successfully.", "WITHDRAWN"));
    }
}
