package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ApplicationStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(SHORTLISTED|ACCEPTED|REJECTED|UNDER_REVIEW)$", message = "Status must be SHORTLISTED, ACCEPTED, REJECTED, or UNDER_REVIEW")
    private String status;

    public ApplicationStatusUpdateRequest() {}

    public ApplicationStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
