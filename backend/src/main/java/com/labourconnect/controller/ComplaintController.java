package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.ComplaintCreateRequest;
import com.labourconnect.dto.ComplaintDto;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.ComplaintService;
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
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ComplaintDto>> fileComplaint(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ComplaintCreateRequest request
    ) {
        ComplaintDto dto = complaintService.fileComplaint(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Complaint registered successfully. Admin will investigate.", dto));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ComplaintDto>>> getMyComplaints(
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ComplaintDto> complaints = complaintService.getUserComplaints(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }
}
