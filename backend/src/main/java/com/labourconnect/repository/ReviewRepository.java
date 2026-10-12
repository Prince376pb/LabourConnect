package com.labourconnect.repository;

import com.labourconnect.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByReviewerIdAndJobId(Long reviewerId, Long jobId);

    boolean existsByReviewerIdAndServiceRequestId(Long reviewerId, Long serviceRequestId);

    Page<Review> findByRevieweeId(Long revieweeId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double getAverageRatingForUser(@Param("revieweeId") Long revieweeId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :revieweeId")
    long getReviewCountForUser(@Param("revieweeId") Long revieweeId);
}
