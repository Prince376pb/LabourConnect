package com.labourconnect.dto;

import java.util.Set;

public class UserSummaryDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Set<String> roles;
    private boolean active;
    private boolean suspended;
    private String suspensionReason;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String email, String fullName, String phoneNumber, Set<String> roles, boolean active, boolean suspended) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
        this.active = active;
        this.suspended = suspended;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }
}
