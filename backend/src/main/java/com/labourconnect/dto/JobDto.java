package com.labourconnect.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

public class JobDto {
    private Long id;
    private Long employerId;
    private String employerCompanyName;
    private String employerContactPerson;
    private String employerCity;
    private String title;
    private String description;
    private String jobType;
    private BigDecimal dailyWage;
    private BigDecimal minMonthlySalary;
    private BigDecimal maxMonthlySalary;
    private String workingHours;
    private Integer estimatedDays;
    private String city;
    private String area;
    private Double latitude;
    private Double longitude;
    private String status;
    private Set<Long> requiredSkillIds;
    private Set<String> requiredSkillNames;
    private Long applicationCount;
    private Instant createdAt;

    public JobDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployerId() { return employerId; }
    public void setEmployerId(Long employerId) { this.employerId = employerId; }

    public String getEmployerCompanyName() { return employerCompanyName; }
    public void setEmployerCompanyName(String employerCompanyName) { this.employerCompanyName = employerCompanyName; }

    public String getEmployerContactPerson() { return employerContactPerson; }
    public void setEmployerContactPerson(String employerContactPerson) { this.employerContactPerson = employerContactPerson; }

    public String getEmployerCity() { return employerCity; }
    public void setEmployerCity(String employerCity) { this.employerCity = employerCity; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Set<Long> getRequiredSkillIds() { return requiredSkillIds; }
    public void setRequiredSkillIds(Set<Long> requiredSkillIds) { this.requiredSkillIds = requiredSkillIds; }

    public Set<String> getRequiredSkillNames() { return requiredSkillNames; }
    public void setRequiredSkillNames(Set<String> requiredSkillNames) { this.requiredSkillNames = requiredSkillNames; }

    public Long getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Long applicationCount) { this.applicationCount = applicationCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
