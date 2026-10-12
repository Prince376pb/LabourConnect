package com.labourconnect.service;

import com.labourconnect.entity.AuditLog;
import com.labourconnect.entity.User;
import com.labourconnect.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logEvent(User user, String action, String entityName, Long entityId, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog(user, action, entityName, entityId, details, ipAddress);
        auditLogRepository.save(auditLog);
    }
}
