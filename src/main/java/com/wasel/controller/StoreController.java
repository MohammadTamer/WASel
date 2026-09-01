package com.wasel.controller;

import com.wasel.dto.store.CreateStoreRequest;
import com.wasel.dto.store.StoreDto;
import com.wasel.dto.store.UpdateStoreRequest;
import com.wasel.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<List<StoreDto>> getAllOpenStores() {
        List<StoreDto> stores = storeService.getAllOpenStores();
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreDto> getStoreById(@PathVariable Long id) {
        StoreDto store = storeService.getStoreById(id);
        return ResponseEntity.ok(store);
    }

    @GetMapping("/my-stores")
    public ResponseEntity<List<StoreDto>> getMyStores(Authentication authentication) {
        List<StoreDto> stores = storeService.getMyStores(authentication.getName());
        return ResponseEntity.ok(stores);
    }

    @PostMapping
    public ResponseEntity<StoreDto> createStore(
            Authentication authentication,
            @Valid @RequestBody CreateStoreRequest request
    ) {
        StoreDto store = storeService.createStore(authentication.getName(), request);
        return new ResponseEntity<>(store, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreDto> updateStore(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStoreRequest request
    ) {
        StoreDto store = storeService.updateStore(authentication.getName(), id, request);
        return ResponseEntity.ok(store);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StoreDto> updateStoreStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        StoreDto store = storeService.updateStoreStatus(authentication.getName(), id, body.get("status"));
        return ResponseEntity.ok(store);
    }
}
