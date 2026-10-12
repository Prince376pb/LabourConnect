package com.labourconnect.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private EmployerProfile employer;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "job_type", nullable = false, length = 50)
    private String jobType = "DAILY_WAGE"; // FULL_TIME, PART_TIME, CONTRACT, DAILY_WAGE, REGULAR

    @Column(name = "daily_wage", precision = 10, scale = 2)
    private BigDecimal dailyWage;

    @Column(name = "min_monthly_salary", precision = 10, scale = 2)
    private BigDecimal minMonthlySalary;

    @Column(name = "max_monthly_salary", precision = 10, scale = 2)
    private BigDecimal maxMonthlySalary;

    @Column(name = "working_hours", length = 100)
    private String workingHours;

    @Column(name = "estimated_days")
    private Integer estimatedDays = 1;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String area;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, CLOSED, CANCELLED

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_required_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> requiredSkills = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Job() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmployerProfile getEmployer() { return employer; }
    public void setEmployer(EmployerProfile employer) { this.employer = employer; }

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

    public Set<Skill> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(Set<Skill> requiredSkills) { this.requiredSkills = requiredSkills; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
