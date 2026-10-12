package com.labourconnect.repository;

import com.labourconnect.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    java.util.Optional<Job> findFirstByTitle(String title);

    boolean existsByTitle(String title);

    long countByStatus(String status);
}
