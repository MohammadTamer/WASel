package com.wasel.repository;

import com.wasel.entity.Store;
import com.wasel.enums.StoreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerId(Long ownerId);

    List<Store> findByStatus(StoreStatus status);

    List<Store> findByStatusNot(StoreStatus status);
}
