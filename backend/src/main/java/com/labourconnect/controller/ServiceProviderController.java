package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.ProviderProfileDto;
import com.labourconnect.service.ProfileService;
import com.labourconnect.service.ServiceRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/services/providers")
public class ServiceProviderController {

    private final ServiceRequestService serviceRequestService;
    private final ProfileService profileService;

    public ServiceProviderController(ServiceRequestService serviceRequestService, ProfileService profileService) {
        this.serviceRequestService = serviceRequestService;
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProviderProfileDto>>> searchProviders(
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "city", required = false) String city,
        @RequestParam(value = "query", required = false) String query,
        @RequestParam(value = "lat", required = false) Double lat,
        @RequestParam(value = "lng", required = false) Double lng,
        @RequestParam(value = "radiusKm", required = false) Double radiusKm,
        @PageableDefault(size = 12) Pageable pageable
    ) {
        Page<ProviderProfileDto> providers = serviceRequestService.searchProviders(
            categoryId, city, query, lat, lng, radiusKm, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProviderProfileDto>> getProviderByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProviderProfile(userId)));
    }
}
