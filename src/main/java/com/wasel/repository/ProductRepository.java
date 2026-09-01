package com.wasel.repository;

import com.wasel.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreId(Long storeId);

    List<Product> findByStoreIdAndIsAvailable(Long storeId, Boolean isAvailable);

    List<Product> findByCategoryId(Long categoryId);
}
