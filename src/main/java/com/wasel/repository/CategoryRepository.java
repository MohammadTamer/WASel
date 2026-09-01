package com.wasel.repository;

import com.wasel.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByStoreId(Long storeId);

    boolean existsByStoreIdAndName(Long storeId, String name);
}
