package com.labourconnect.dto;

public class GoogleAuthResponse {

    private boolean needsRegistration;
    private String email;
    private String fullName;
    private String accessToken;
    private String tokenType = "Bearer";
    private UserSummaryDto user;
    private String message;

    public GoogleAuthResponse() {}

    public static GoogleAuthResponse needsRegistration(String email, String fullName, String message) {
        GoogleAuthResponse resp = new GoogleAuthResponse();
        resp.setNeedsRegistration(true);
        resp.setEmail(email);
        resp.setFullName(fullName);
        resp.setMessage(message);
        return resp;
    }

    public static GoogleAuthResponse authenticated(String accessToken, UserSummaryDto user, String message) {
        GoogleAuthResponse resp = new GoogleAuthResponse();
        resp.setNeedsRegistration(false);
        resp.setAccessToken(accessToken);
        resp.setUser(user);
        resp.setEmail(user != null ? user.getEmail() : null);
        resp.setFullName(user != null ? user.getFullName() : null);
        resp.setMessage(message);
        return resp;
    }

    public boolean isNeedsRegistration() {
        return needsRegistration;
    }

    public void setNeedsRegistration(boolean needsRegistration) {
        this.needsRegistration = needsRegistration;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
