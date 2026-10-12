package com.labourconnect.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Set;

public class JobCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Job type is required")
    private String jobType = "DAILY_WAGE"; // FULL_TIME, PART_TIME, CONTRACT, DAILY_WAGE, REGULAR

    @DecimalMin(value = "0.0", inclusive = false, message = "Wage must be greater than 0")
    private BigDecimal dailyWage;

    @DecimalMin(value = "0.0", inclusive = false, message = "Minimum monthly salary must be greater than 0")
    private BigDecimal minMonthlySalary;

    @DecimalMin(value = "0.0", inclusive = false, message = "Maximum monthly salary must be greater than 0")
    private BigDecimal maxMonthlySalary;

    private String workingHours;

    private Integer estimatedDays = 1;

    @NotBlank(message = "City is required")
    private String city;

    private String area;
    private Double latitude;
    private Double longitude;

    private Set<Long> requiredSkillIds;

    public JobCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public BigDecimal getDailyWage() { return dailyWage; }
    public void setDailyWage(BigDecimal dailyWage) { this.dailyWage = dailyWage; }

    public BigDecimal getMinMonthlySalary() { return minMonthlySalary; }
    public void setMinMonthlySalary(BigDecimal minMonthlySalary) { this.minMonthlySalary = minMonthlySalary; }

    public BigDecimal getMaxMonthlySalary() { return maxMonthlySalary; }
    public void setMaxMonthlySalary(BigDecimal maxMonthlySalary) { this.maxMonthlySalary = maxMonthlySalary; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }

    public Integer getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Set<Long> getRequiredSkillIds() { return requiredSkillIds; }
    public void setRequiredSkillIds(Set<Long> requiredSkillIds) { this.requiredSkillIds = requiredSkillIds; }
}
