package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ComplaintResolveRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(INVESTIGATING|RESOLVED|DISMISSED)$", message = "Status must be INVESTIGATING, RESOLVED, or DISMISSED")
    private String status;

    @NotBlank(message = "Resolution notes are required")
    private String adminResolutionNotes;

    public ComplaintResolveRequest() {}

    public ComplaintResolveRequest(String status, String adminResolutionNotes) {
        this.status = status;
        this.adminResolutionNotes = adminResolutionNotes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminResolutionNotes() { return adminResolutionNotes; }
    public void setAdminResolutionNotes(String adminResolutionNotes) { this.adminResolutionNotes = adminResolutionNotes; }
}
