package com.wasel.service;

import com.wasel.dto.store.CreateStoreRequest;
import com.wasel.dto.store.StoreDto;
import com.wasel.dto.store.UpdateStoreRequest;
import com.wasel.entity.Store;
import com.wasel.entity.User;
import com.wasel.enums.StoreStatus;
import com.wasel.enums.UserRole;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.StoreRepository;
import com.wasel.repository.StoreEmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final StoreEmployeeRepository storeEmployeeRepository;
    private final UserService userService;

    public List<StoreDto> getAllOpenStores() {
        return storeRepository.findByStatus(StoreStatus.OPEN).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<StoreDto> getAllStores() {
        return storeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public StoreDto getStoreById(Long id) {
        Store store = findStoreById(id);
        return mapToDto(store);
    }

    public Store findStoreById(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
    }

    @Transactional
    public StoreDto createStore(String email, CreateStoreRequest request) {
        User owner = userService.getUserByEmail(email);

        if (owner.getRole() != UserRole.STORE_OWNER && owner.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only store owners can create stores");
        }

        Store store = Store.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .phone(request.getPhone())
                .address(request.getAddress())
                .deliveryFee(request.getDeliveryFee())
                .status(StoreStatus.CLOSED)
                .build();

        store = storeRepository.save(store);
        return mapToDto(store);
    }

    @Transactional
    public StoreDto updateStore(String email, Long storeId, UpdateStoreRequest request) {
        User user = userService.getUserByEmail(email);
        Store store = findStoreById(storeId);

        validateStoreAccess(user, store);

        if (request.getName() != null) store.setName(request.getName());
        if (request.getDescription() != null) store.setDescription(request.getDescription());
        if (request.getPhone() != null) store.setPhone(request.getPhone());
        if (request.getAddress() != null) store.setAddress(request.getAddress());
        if (request.getDeliveryFee() != null) store.setDeliveryFee(request.getDeliveryFee());

        store = storeRepository.save(store);
        return mapToDto(store);
    }

    @Transactional
    public StoreDto updateStoreStatus(String email, Long storeId, String status) {
        User user = userService.getUserByEmail(email);
        Store store = findStoreById(storeId);

        validateStoreAccess(user, store);

        StoreStatus newStatus;
        try {
            newStatus = StoreStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid store status: " + status);
        }

        store.setStatus(newStatus);
        store = storeRepository.save(store);
        return mapToDto(store);
    }

    public List<StoreDto> getMyStores(String email) {
        User user = userService.getUserByEmail(email);
        return storeRepository.findByOwnerId(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void validateStoreAccess(User user, Store store) {
        if (user.getRole() == UserRole.ADMIN) return;

        if (store.getOwner().getId().equals(user.getId())) return;

        if (storeEmployeeRepository.existsByStoreIdAndUserId(store.getId(), user.getId())) return;

        throw new ForbiddenException("You do not have access to this store");
    }

    public StoreDto mapToDto(Store store) {
        return StoreDto.builder()
                .id(store.getId())
                .ownerId(store.getOwner().getId())
                .ownerName(store.getOwner().getName())
                .name(store.getName())
                .description(store.getDescription())
                .phone(store.getPhone())
                .address(store.getAddress())
                .status(store.getStatus().name())
                .rating(store.getRating())
                .deliveryFee(store.getDeliveryFee())
                .createdAt(store.getCreatedAt())
                .build();
    }
}
