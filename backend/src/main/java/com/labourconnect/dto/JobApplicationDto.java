package com.labourconnect.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

public class JobApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String jobType;
    private String jobCity;
    private BigDecimal jobDailyWage;
    private BigDecimal jobMinMonthlySalary;
    private BigDecimal jobMaxMonthlySalary;
    private String jobWorkingHours;
    private String employerCompanyName;

    private Long workerId;
    private Long workerUserId;
    private String workerFullName;
    private String workerPhone;
    private String workerHeadline;
    private Integer workerYearsOfExperience;
    private Set<String> workerSkills;
    private Double workerRating;

    private String coverNote;
    private BigDecimal bidAmount;
    private String status;
    private Instant createdAt;

    public JobApplicationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getJobCity() { return jobCity; }
    public void setJobCity(String jobCity) { this.jobCity = jobCity; }

    public BigDecimal getJobDailyWage() { return jobDailyWage; }
    public void setJobDailyWage(BigDecimal jobDailyWage) { this.jobDailyWage = jobDailyWage; }

    public BigDecimal getJobMinMonthlySalary() { return jobMinMonthlySalary; }
    public void setJobMinMonthlySalary(BigDecimal jobMinMonthlySalary) { this.jobMinMonthlySalary = jobMinMonthlySalary; }

    public BigDecimal getJobMaxMonthlySalary() { return jobMaxMonthlySalary; }
    public void setJobMaxMonthlySalary(BigDecimal jobMaxMonthlySalary) { this.jobMaxMonthlySalary = jobMaxMonthlySalary; }

    public String getJobWorkingHours() { return jobWorkingHours; }
    public void setJobWorkingHours(String jobWorkingHours) { this.jobWorkingHours = jobWorkingHours; }

    public String getEmployerCompanyName() { return employerCompanyName; }
    public void setEmployerCompanyName(String employerCompanyName) { this.employerCompanyName = employerCompanyName; }

    public Long getWorkerId() { return workerId; }
    public void setWorkerId(Long workerId) { this.workerId = workerId; }

    public Long getWorkerUserId() { return workerUserId; }
    public void setWorkerUserId(Long workerUserId) { this.workerUserId = workerUserId; }

    public String getWorkerFullName() { return workerFullName; }
    public void setWorkerFullName(String workerFullName) { this.workerFullName = workerFullName; }

    public String getWorkerPhone() { return workerPhone; }
    public void setWorkerPhone(String workerPhone) { this.workerPhone = workerPhone; }

    public String getWorkerHeadline() { return workerHeadline; }
    public void setWorkerHeadline(String workerHeadline) { this.workerHeadline = workerHeadline; }

    public Integer getWorkerYearsOfExperience() { return workerYearsOfExperience; }
    public void setWorkerYearsOfExperience(Integer workerYearsOfExperience) { this.workerYearsOfExperience = workerYearsOfExperience; }

    public Set<String> getWorkerSkills() { return workerSkills; }
    public void setWorkerSkills(Set<String> workerSkills) { this.workerSkills = workerSkills; }

    public Double getWorkerRating() { return workerRating; }
    public void setWorkerRating(Double workerRating) { this.workerRating = workerRating; }

    public String getCoverNote() { return coverNote; }
    public void setCoverNote(String coverNote) { this.coverNote = coverNote; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
