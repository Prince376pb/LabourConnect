package com.labourconnect.repository;

import com.labourconnect.entity.ProviderProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long>, JpaSpecificationExecutor<ProviderProfile> {

    Optional<ProviderProfile> findByUserId(Long userId);

    Page<ProviderProfile> findByVerificationStatus(String verificationStatus, Pageable pageable);

    long countByVerificationStatus(String verificationStatus);
}
