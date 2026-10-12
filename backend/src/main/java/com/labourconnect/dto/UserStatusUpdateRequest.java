package com.labourconnect.dto;

import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateRequest {

    @NotNull(message = "Suspension status is required")
    private Boolean suspended;

    private String suspensionReason;

    public UserStatusUpdateRequest() {}

    public UserStatusUpdateRequest(Boolean suspended, String suspensionReason) {
        this.suspended = suspended;
        this.suspensionReason = suspensionReason;
    }

    public Boolean getSuspended() { return suspended; }
    public void setSuspended(Boolean suspended) { this.suspended = suspended; }

    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }
}
