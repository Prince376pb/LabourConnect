package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ServiceStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status; // ACCEPTED, ON_THE_WAY, SERVICE_STARTED, COMPLETED, REJECTED, CANCELLED

    private String reason;
    private BigDecimal finalCost;

    public ServiceStatusUpdateRequest() {}

    public ServiceStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public BigDecimal getFinalCost() { return finalCost; }
    public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }
}
