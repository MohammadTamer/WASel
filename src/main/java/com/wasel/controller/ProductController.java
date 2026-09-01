package com.wasel.controller;

import com.wasel.dto.product.CreateProductRequest;
import com.wasel.dto.product.ProductDto;
import com.wasel.dto.product.UpdateProductRequest;
import com.wasel.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getStoreProducts(@PathVariable Long storeId) {
        List<ProductDto> products = productService.getStoreProducts(storeId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long storeId, @PathVariable Long id) {
        ProductDto product = productService.getProductById(storeId, id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(
            Authentication authentication,
            @PathVariable Long storeId,
            @Valid @RequestBody CreateProductRequest request
    ) {
        ProductDto product = productService.createProduct(authentication.getName(), storeId, request);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductDto product = productService.updateProduct(authentication.getName(), storeId, id, request);
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ProductDto> toggleAvailability(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long id
    ) {
        ProductDto product = productService.toggleAvailability(authentication.getName(), storeId, id);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long id
    ) {
        productService.deleteProduct(authentication.getName(), storeId, id);
        return ResponseEntity.noContent().build();
    }
}
