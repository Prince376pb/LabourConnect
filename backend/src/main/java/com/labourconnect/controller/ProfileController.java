package com.labourconnect.controller;

import com.labourconnect.dto.*;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // --- WORKER ---
    @GetMapping("/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> getWorkerProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getWorkerProfile(principal.getId())));
    }

    @PutMapping("/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> updateWorkerProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody WorkerProfileDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Worker profile updated.", profileService.updateWorkerProfile(principal.getId(), dto)));
    }

    // --- EMPLOYER ---
    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<EmployerProfileDto>> getEmployerProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getEmployerProfile(principal.getId())));
    }

    @PutMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<EmployerProfileDto>> updateEmployerProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody EmployerProfileDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Employer profile updated.", profileService.updateEmployerProfile(principal.getId(), dto)));
    }

    // --- CUSTOMER ---
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> getCustomerProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getCustomerProfile(principal.getId())));
    }

    @PutMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateCustomerProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody CustomerProfileDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Customer profile updated.", profileService.updateCustomerProfile(principal.getId(), dto)));
    }

    // --- PROVIDER ---
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<ProviderProfileDto>> getProviderProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProviderProfile(principal.getId())));
    }

    @PutMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<ProviderProfileDto>> updateProviderProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody ProviderProfileDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Provider profile updated.", profileService.updateProviderProfile(principal.getId(), dto)));
    }
}
