package com.wasel.service;

import com.wasel.dto.store.StoreEmployeeDto;
import com.wasel.entity.Store;
import com.wasel.entity.StoreEmployee;
import com.wasel.entity.User;
import com.wasel.enums.UserRole;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.DuplicateResourceException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.StoreEmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreEmployeeService {

    private final StoreEmployeeRepository storeEmployeeRepository;
    private final StoreService storeService;
    private final UserService userService;

    @Transactional
    public StoreEmployeeDto addEmployeeByEmail(String ownerEmail, Long storeId, String employeeEmail) {
        User owner = userService.getUserByEmail(ownerEmail);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(owner, store);

        User employee = userService.getUserByEmail(employeeEmail);
        if (employee.getRole() != UserRole.STORE_EMPLOYEE) {
            throw new BadRequestException("User '" + employeeEmail + "' is not registered as a store employee");
        }

        if (storeEmployeeRepository.existsByStoreIdAndUserId(storeId, employee.getId())) {
            throw new DuplicateResourceException("Employee is already assigned to this store");
        }

        StoreEmployee storeEmployee = StoreEmployee.builder()
                .store(store)
                .user(employee)
                .build();

        storeEmployee = storeEmployeeRepository.save(storeEmployee);
        return mapToDto(storeEmployee);
    }

    @Transactional
    public StoreEmployeeDto addEmployee(String ownerEmail, Long storeId, Long employeeUserId) {
        User owner = userService.getUserByEmail(ownerEmail);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(owner, store);

        User employee = userService.getUserById(employeeUserId);
        if (employee.getRole() != UserRole.STORE_EMPLOYEE) {
            throw new BadRequestException("User is not registered as a store employee");
        }

        if (storeEmployeeRepository.existsByStoreIdAndUserId(storeId, employeeUserId)) {
            throw new DuplicateResourceException("Employee is already assigned to this store");
        }

        StoreEmployee storeEmployee = StoreEmployee.builder()
                .store(store)
                .user(employee)
                .build();

        storeEmployee = storeEmployeeRepository.save(storeEmployee);
        return mapToDto(storeEmployee);
    }

    @Transactional
    public void removeEmployee(String ownerEmail, Long storeId, Long employeeUserId) {
        User owner = userService.getUserByEmail(ownerEmail);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(owner, store);

        StoreEmployee storeEmployee = storeEmployeeRepository.findByStoreIdAndUserId(storeId, employeeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found in this store"));

        storeEmployeeRepository.delete(storeEmployee);
    }

    public List<StoreEmployeeDto> getEmployeesByStore(String userEmail, Long storeId) {
        User user = userService.getUserByEmail(userEmail);
        Store store = storeService.findStoreById(storeId);
        validateOwnerOnlyAccess(user, store);

        return storeEmployeeRepository.findByStoreId(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<Long> getStoreIdsForEmployee(Long userId) {
        return storeEmployeeRepository.findByUserId(userId).stream()
                .map(se -> se.getStore().getId())
                .toList();
    }

    private void validateOwnerOnlyAccess(User user, Store store) {
        if (user.getRole() == UserRole.ADMIN) return;
        if (store.getOwner().getId().equals(user.getId())) return;

        throw new ForbiddenException("Only the store owner or admin can manage store employees");
    }

    private StoreEmployeeDto mapToDto(StoreEmployee se) {
        return StoreEmployeeDto.builder()
                .id(se.getId())
                .userId(se.getUser().getId())
                .name(se.getUser().getName())
                .email(se.getUser().getEmail())
                .phone(se.getUser().getPhone())
                .storeId(se.getStore().getId())
                .storeName(se.getStore().getName())
                .assignedAt(se.getCreatedAt())
                .build();
    }
}
