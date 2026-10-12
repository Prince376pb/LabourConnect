package com.labourconnect.dto;

public class AdminStatsDto {
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long totalJobs;
    private long openJobs;
    private long totalServiceRequests;
    private long completedServiceRequests;
    private long pendingVerifications;
    private long pendingComplaints;

    public AdminStatsDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getSuspendedUsers() { return suspendedUsers; }
    public void setSuspendedUsers(long suspendedUsers) { this.suspendedUsers = suspendedUsers; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getOpenJobs() { return openJobs; }
    public void setOpenJobs(long openJobs) { this.openJobs = openJobs; }

    public long getTotalServiceRequests() { return totalServiceRequests; }
    public void setTotalServiceRequests(long totalServiceRequests) { this.totalServiceRequests = totalServiceRequests; }

    public long getCompletedServiceRequests() { return completedServiceRequests; }
    public void setCompletedServiceRequests(long completedServiceRequests) { this.completedServiceRequests = completedServiceRequests; }

    public long getPendingVerifications() { return pendingVerifications; }
    public void setPendingVerifications(long pendingVerifications) { this.pendingVerifications = pendingVerifications; }

    public long getPendingComplaints() { return pendingComplaints; }
    public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }
}
