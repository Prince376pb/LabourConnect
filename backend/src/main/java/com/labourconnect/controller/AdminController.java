package com.labourconnect.controller;

import com.labourconnect.dto.*;
import com.labourconnect.entity.AuditLog;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.AdminService;
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
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ComplaintService complaintService;

    public AdminController(AdminService adminService, ComplaintService complaintService) {
        this.adminService = adminService;
        this.complaintService = complaintService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPlatformStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserSummaryDto>>> listUsers(
        @RequestParam(value = "role", required = false) String role,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<UserSummaryDto> users = adminService.listUsers(role, status, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateUserStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        UserSummaryDto user = adminService.updateUserStatus(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("User status updated.", user));
    }

    @GetMapping("/verifications")
    public ResponseEntity<ApiResponse<Page<ProviderProfileDto>>> getVerifications(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProviderProfileDto> verifications = adminService.getVerifications(status, categoryId, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(verifications));
    }

    @PutMapping("/verifications/{id}")
    public ResponseEntity<ApiResponse<ProviderProfileDto>> decideVerification(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody VerificationDecisionRequest request
    ) {
        ProviderProfileDto result = adminService.decideVerification(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Verification decision processed.", result));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintDto>>> listComplaints(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ComplaintDto> complaints = complaintService.getAllComplaints(status, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @PutMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintDto>> resolveComplaint(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody ComplaintResolveRequest request
    ) {
        ComplaintDto resolved = complaintService.resolveComplaint(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Complaint updated successfully.", resolved));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
        @RequestParam(value = "action", required = false) String action,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AuditLog> logs = adminService.getAuditLogs(action, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
