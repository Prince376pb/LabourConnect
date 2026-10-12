package com.labourconnect.service;

import com.labourconnect.dto.ServiceCategoryDto;
import com.labourconnect.entity.ServiceCategory;
import com.labourconnect.exception.BadRequestException;
import com.labourconnect.exception.ResourceNotFoundException;
import com.labourconnect.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public ServiceCategoryService(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public ServiceCategoryDto createCategory(ServiceCategoryDto dto) {
        String slug = dto.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("A category with this name already exists.");
        }

        ServiceCategory category = new ServiceCategory();
        category.setName(dto.getName().trim());
        category.setSlug(slug);
        category.setIconName(dto.getIconName() != null ? dto.getIconName() : "Wrench");
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public ServiceCategoryDto updateCategory(Long id, ServiceCategoryDto dto) {
        ServiceCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(dto.getName().trim());
        category.setIconName(dto.getIconName());
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());

        return mapToDto(categoryRepository.save(category));
    }

    public ServiceCategoryDto mapToDto(ServiceCategory cat) {
        return new ServiceCategoryDto(
            cat.getId(),
            cat.getName(),
            cat.getSlug(),
            cat.getIconName(),
            cat.getDescription(),
            cat.isActive()
        );
    }
}
