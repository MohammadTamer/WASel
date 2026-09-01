package com.wasel.controller;

import com.wasel.dto.category.CategoryDto;
import com.wasel.dto.category.CreateCategoryRequest;
import com.wasel.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getStoreCategories(@PathVariable Long storeId) {
        List<CategoryDto> categories = categoryService.getStoreCategories(storeId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            Authentication authentication,
            @PathVariable Long storeId,
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryDto category = categoryService.createCategory(authentication.getName(), storeId, request);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryDto category = categoryService.updateCategory(authentication.getName(), storeId, id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(authentication.getName(), storeId, id);
        return ResponseEntity.noContent().build();
    }
}
