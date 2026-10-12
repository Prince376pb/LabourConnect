package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class ServiceCategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String slug;
    private String iconName;
    private String description;
    private boolean active = true;

    public ServiceCategoryDto() {}

    public ServiceCategoryDto(Long id, String name, String slug, String iconName, String description, boolean active) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.iconName = iconName;
        this.description = description;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
