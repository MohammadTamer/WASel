package com.wasel.service;

import com.wasel.dto.product.CreateProductRequest;
import com.wasel.dto.product.ProductDto;
import com.wasel.dto.product.UpdateProductRequest;
import com.wasel.entity.Category;
import com.wasel.entity.Product;
import com.wasel.entity.Store;
import com.wasel.entity.User;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.CategoryRepository;
import com.wasel.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoreService storeService;
    private final UserService userService;

    public List<ProductDto> getStoreProducts(Long storeId) {
        return productRepository.findByStoreId(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getAvailableStoreProducts(Long storeId) {
        return productRepository.findByStoreIdAndIsAvailable(storeId, true).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long storeId, Long productId) {
        Product product = findProductById(productId);
        if (!product.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Product not found in this store");
        }
        return mapToDto(product);
    }

    public Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductDto createProduct(String email, Long storeId, CreateProductRequest request) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        storeService.validateStoreAccess(user, store);

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            if (!category.getStore().getId().equals(storeId)) {
                throw new BadRequestException("Category does not belong to this store");
            }
        }

        Product product = Product.builder()
                .store(store)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isAvailable(true)
                .build();

        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public ProductDto updateProduct(String email, Long storeId, Long productId, UpdateProductRequest request) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        storeService.validateStoreAccess(user, store);

        Product product = findProductById(productId);
        if (!product.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Product not found in this store");
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            if (!category.getStore().getId().equals(storeId)) {
                throw new BadRequestException("Category does not belong to this store");
            }
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public ProductDto toggleAvailability(String email, Long storeId, Long productId) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        storeService.validateStoreAccess(user, store);

        Product product = findProductById(productId);
        if (!product.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Product not found in this store");
        }

        product.setIsAvailable(!product.getIsAvailable());
        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public void deleteProduct(String email, Long storeId, Long productId) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        storeService.validateStoreAccess(user, store);

        Product product = findProductById(productId);
        if (!product.getStore().getId().equals(storeId)) {
            throw new ResourceNotFoundException("Product not found in this store");
        }

        productRepository.delete(product);
    }

    public ProductDto mapToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .storeId(product.getStore().getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .isAvailable(product.getIsAvailable())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
