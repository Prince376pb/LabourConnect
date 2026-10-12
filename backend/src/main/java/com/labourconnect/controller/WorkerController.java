package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.WorkerProfileDto;
import com.labourconnect.service.ProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workers")
public class WorkerController {

    private final ProfileService profileService;

    public WorkerController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<WorkerProfileDto>>> searchWorkers(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String availability,
        @RequestParam(required = false) Long skillId,
        @RequestParam(required = false) String query,
        @PageableDefault(sort = "yearsOfExperience", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<WorkerProfileDto> workers = profileService.searchWorkers(city, availability, skillId, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(workers));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> getWorkerByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getWorkerProfile(userId)));
    }
}
