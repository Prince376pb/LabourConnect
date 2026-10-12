package com.labourconnect.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class JobApplicationCreateRequest {

    private String coverNote;

    @DecimalMin(value = "0.0", message = "Bid amount must be positive")
    private BigDecimal bidAmount;

    public JobApplicationCreateRequest() {}

    public JobApplicationCreateRequest(String coverNote, BigDecimal bidAmount) {
        this.coverNote = coverNote;
        this.bidAmount = bidAmount;
    }

    public String getCoverNote() { return coverNote; }
    public void setCoverNote(String coverNote) { this.coverNote = coverNote; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }
}
