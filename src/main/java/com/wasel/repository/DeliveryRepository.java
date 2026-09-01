package com.wasel.repository;

import com.wasel.entity.Delivery;
import com.wasel.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    List<Delivery> findByStatus(DeliveryStatus status);

    List<Delivery> findByDriverIdAndStatus(Long driverId, DeliveryStatus status);
}
