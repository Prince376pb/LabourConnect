package com.labourconnect.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ServiceRequestDto {
    private Long id;
    private Long customerId;
    private Long customerUserId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;

    private Long providerId;
    private Long providerUserId;
    private String providerBusinessName;
    private String providerPhone;
    private String providerVerificationStatus;

    private Long categoryId;
    private String categoryName;

    private String title;
    private String description;
    private String serviceAddress;
    private String city;
    private Double latitude;
    private Double longitude;
    private Instant scheduledAt;
    private BigDecimal estimatedCost;
    private BigDecimal finalCost;
    private String status;
    private String rejectionReason;
    private String cancellationReason;
    private Instant createdAt;

    public ServiceRequestDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getCustomerUserId() { return customerUserId; }
    public void setCustomerUserId(Long customerUserId) { this.customerUserId = customerUserId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getProviderUserId() { return providerUserId; }
    public void setProviderUserId(Long providerUserId) { this.providerUserId = providerUserId; }

    public String getProviderBusinessName() { return providerBusinessName; }
    public void setProviderBusinessName(String providerBusinessName) { this.providerBusinessName = providerBusinessName; }

    public String getProviderPhone() { return providerPhone; }
    public void setProviderPhone(String providerPhone) { this.providerPhone = providerPhone; }

    public String getProviderVerificationStatus() { return providerVerificationStatus; }
    public void setProviderVerificationStatus(String providerVerificationStatus) { this.providerVerificationStatus = providerVerificationStatus; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getServiceAddress() { return serviceAddress; }
    public void setServiceAddress(String serviceAddress) { this.serviceAddress = serviceAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public BigDecimal getFinalCost() { return finalCost; }
    public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
