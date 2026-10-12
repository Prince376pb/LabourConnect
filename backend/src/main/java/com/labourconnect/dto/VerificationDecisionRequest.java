package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerificationDecisionRequest {

    @NotBlank(message = "Decision status is required")
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "Decision status must be APPROVED or REJECTED")
    private String status;

    private String notes;

    public VerificationDecisionRequest() {}

    public VerificationDecisionRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
