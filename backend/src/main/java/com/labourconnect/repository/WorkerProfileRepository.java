package com.labourconnect.repository;

import com.labourconnect.entity.WorkerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long>, JpaSpecificationExecutor<WorkerProfile> {

    Optional<WorkerProfile> findByUserId(Long userId);
}
