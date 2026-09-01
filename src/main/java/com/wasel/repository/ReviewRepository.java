package com.wasel.repository;

import com.wasel.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByOrderId(Long orderId);

    List<Review> findByCustomerId(Long customerId);

    boolean existsByOrderId(Long orderId);

    @Query("SELECT r FROM Review r WHERE r.order.store.id = :storeId ORDER BY r.createdAt DESC")
    List<Review> findByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT AVG(r.storeRating) FROM Review r WHERE r.order.store.id = :storeId AND r.storeRating IS NOT NULL")
    Double getAverageStoreRating(@Param("storeId") Long storeId);

    @Query("SELECT AVG(r.driverRating) FROM Review r WHERE r.order.delivery.driver.id = :driverId AND r.driverRating IS NOT NULL")
    Double getAverageDriverRating(@Param("driverId") Long driverId);
}
