package com.wasel.repository;

import com.wasel.entity.StoreEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreEmployeeRepository extends JpaRepository<StoreEmployee, Long> {

    List<StoreEmployee> findByStoreId(Long storeId);

    List<StoreEmployee> findByUserId(Long userId);

    Optional<StoreEmployee> findByStoreIdAndUserId(Long storeId, Long userId);

    boolean existsByStoreIdAndUserId(Long storeId, Long userId);
}
