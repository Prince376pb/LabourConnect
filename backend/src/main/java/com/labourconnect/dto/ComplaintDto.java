package com.labourconnect.dto;

import java.time.Instant;

public class ComplaintDto {
    private Long id;
    private Long complainantId;
    private String complainantName;
    private Long reportedUserId;
    private String reportedUserName;
    private Long serviceRequestId;
    private Long jobId;
    private String subject;
    private String description;
    private String status;
    private String adminResolutionNotes;
    private Long resolvedByAdminId;
    private String resolvedByAdminName;
    private Instant createdAt;
    private Instant updatedAt;

    public ComplaintDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplainantId() { return complainantId; }
    public void setComplainantId(Long complainantId) { this.complainantId = complainantId; }

    public String getComplainantName() { return complainantName; }
    public void setComplainantName(String complainantName) { this.complainantName = complainantName; }

    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }

    public String getReportedUserName() { return reportedUserName; }
    public void setReportedUserName(String reportedUserName) { this.reportedUserName = reportedUserName; }

    public Long getServiceRequestId() { return serviceRequestId; }
    public void setServiceRequestId(Long serviceRequestId) { this.serviceRequestId = serviceRequestId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminResolutionNotes() { return adminResolutionNotes; }
    public void setAdminResolutionNotes(String adminResolutionNotes) { this.adminResolutionNotes = adminResolutionNotes; }

    public Long getResolvedByAdminId() { return resolvedByAdminId; }
    public void setResolvedByAdminId(Long resolvedByAdminId) { this.resolvedByAdminId = resolvedByAdminId; }

    public String getResolvedByAdminName() { return resolvedByAdminName; }
    public void setResolvedByAdminName(String resolvedByAdminName) { this.resolvedByAdminName = resolvedByAdminName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
