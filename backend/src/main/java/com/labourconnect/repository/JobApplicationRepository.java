package com.labourconnect.repository;

import com.labourconnect.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    boolean existsByJobIdAndWorkerId(Long jobId, Long workerId);

    Optional<JobApplication> findByJobIdAndWorkerId(Long jobId, Long workerId);

    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);

    Page<JobApplication> findByWorkerId(Long workerId, Pageable pageable);

    long countByJobId(Long jobId);
}
