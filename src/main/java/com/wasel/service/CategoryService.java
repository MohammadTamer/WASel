package com.wasel.service;

import com.wasel.dto.category.CategoryDto;
import com.wasel.dto.category.CreateCategoryRequest;
import com.wasel.entity.Category;
import com.wasel.entity.Store;
import com.wasel.entity.User;
import com.wasel.enums.UserRole;
import com.wasel.exception.DuplicateResourceException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final StoreService storeService;
    private final UserService userService;

    public List<CategoryDto> getStoreCategories(Long storeId) {
        return categoryRepository.findByStoreId(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(String email, Long storeId, CreateCategoryRequest request) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(user, store);

        if (categoryRepository.existsByStoreIdAndName(storeId, request.getName())) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists in this store");
        }

        Category category = Category.builder()
                .store(store)
                .name(request.getName())
                .build();

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(String email, Long storeId, Long categoryId, CreateCategoryRequest request) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(user, store);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Category not found in this store");
        }

        if (categoryRepository.existsByStoreIdAndName(storeId, request.getName())
                && !category.getName().equals(request.getName())) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists in this store");
        }

        category.setName(request.getName());
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public void deleteCategory(String email, Long storeId, Long categoryId) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(user, store);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Category not found in this store");
        }

        categoryRepository.delete(category);
    }

    private void validateOwnerOnlyAccess(User user, Store store) {
        if (user.getRole() == UserRole.ADMIN) return;
        if (store.getOwner().getId().equals(user.getId())) return;

        throw new ForbiddenException("Only the store owner or admin can manage store categories");
    }

    public CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .storeId(category.getStore().getId())
                .name(category.getName())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
