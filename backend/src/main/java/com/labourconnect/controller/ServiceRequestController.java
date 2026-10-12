package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.ServiceRequestCreateRequest;
import com.labourconnect.dto.ServiceRequestDto;
import com.labourconnect.dto.ServiceStatusUpdateRequest;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.ServiceRequestService;
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
@RequestMapping("/api/v1/requests")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> createRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ServiceRequestCreateRequest request
    ) {
        ServiceRequestDto dto = serviceRequestService.createRequest(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Service request booked successfully.", dto));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<ServiceRequestDto>>> getCustomerRequests(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ServiceRequestDto> requests = serviceRequestService.getCustomerRequests(principal.getId(), status, categoryId, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(requests));
    }

    @GetMapping("/provider-requests")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<Page<ServiceRequestDto>>> getProviderRequests(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "query", required = false) String query,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ServiceRequestDto> requests = serviceRequestService.getProviderRequests(principal.getId(), status, categoryId, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> getRequestById(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        ServiceRequestDto dto = serviceRequestService.getRequestById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> updateStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody ServiceStatusUpdateRequest update
    ) {
        ServiceRequestDto dto = serviceRequestService.updateStatus(principal.getId(), id, update);
        return ResponseEntity.ok(ApiResponse.ok("Service request status updated.", dto));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> cancelRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestParam(required = false, defaultValue = "Cancelled by customer") String reason
    ) {
        ServiceRequestDto dto = serviceRequestService.cancelRequest(principal.getId(), id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Service request cancelled.", dto));
    }
}
