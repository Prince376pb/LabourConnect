package com.labourconnect.controller;

import com.labourconnect.dto.ApiResponse;
import com.labourconnect.dto.ServiceCategoryDto;
import com.labourconnect.service.ServiceCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    public ServiceCategoryController(ServiceCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCategoryDto>>> getCategories(
        @RequestParam(required = false, defaultValue = "true") boolean activeOnly
    ) {
        List<ServiceCategoryDto> categories = activeOnly
            ? categoryService.getActiveCategories()
            : categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceCategoryDto>> createCategory(@Valid @RequestBody ServiceCategoryDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully.", categoryService.createCategory(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceCategoryDto>> updateCategory(
        @PathVariable Long id,
        @Valid @RequestBody ServiceCategoryDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully.", categoryService.updateCategory(id, dto)));
    }
}
