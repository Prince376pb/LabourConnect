package com.labourconnect.repository;

import com.labourconnect.entity.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long>, JpaSpecificationExecutor<ServiceRequest> {

    Page<ServiceRequest> findByCustomerId(Long customerId, Pageable pageable);

    Page<ServiceRequest> findByProviderId(Long providerId, Pageable pageable);

    Page<ServiceRequest> findByStatus(String status, Pageable pageable);

    boolean existsByTitle(String title);

    Optional<ServiceRequest> findFirstByTitle(String title);

    long countByStatus(String status);
}
