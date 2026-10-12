package com.labourconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    private String role; // Optional for existing users; required when completing new registration

    private String phoneNumber; // Optional for existing users; required when completing new registration

    private String fullName; // Optional override

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String idToken, String role, String phoneNumber, String fullName) {
        this.idToken = idToken;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.fullName = fullName;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
