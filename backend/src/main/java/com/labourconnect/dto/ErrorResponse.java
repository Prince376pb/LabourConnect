package com.labourconnect.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ErrorResponse {
    private Instant timestamp = Instant.now();
    private int status;
    private String error;
    private String message;
    private String path;
    private List<FieldErrorItem> fieldErrors = new ArrayList<>();

    public ErrorResponse() {}

    public ErrorResponse(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = Instant.now();
    }

    public static class FieldErrorItem {
        private String field;
        private String message;

        public FieldErrorItem() {}

        public FieldErrorItem(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public List<FieldErrorItem> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(List<FieldErrorItem> fieldErrors) { this.fieldErrors = fieldErrors; }

    public void addFieldError(String field, String message) {
        this.fieldErrors.add(new FieldErrorItem(field, message));
    }
}
