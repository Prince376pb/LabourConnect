package com.labourconnect.repository;

import com.labourconnect.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Page<Complaint> findByComplainantId(Long complainantId, Pageable pageable);

    Page<Complaint> findByReportedUserId(Long reportedUserId, Pageable pageable);

    Page<Complaint> findByStatus(String status, Pageable pageable);

    boolean existsBySubject(String subject);

    long countByStatus(String status);
}
