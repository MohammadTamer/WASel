package com.wasel.service;

import com.wasel.entity.Store;
import com.wasel.entity.StoreEmployee;
import com.wasel.entity.User;
import com.wasel.enums.UserRole;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.DuplicateResourceException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.StoreEmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreEmployeeService {

    private final StoreEmployeeRepository storeEmployeeRepository;
    private final StoreService storeService;
    private final UserService userService;

    @Transactional
    public void addEmployee(String ownerEmail, Long storeId, Long employeeUserId) {
        User owner = userService.getUserByEmail(ownerEmail);
        Store store = storeService.findStoreById(storeId);

        storeService.validateStoreAccess(owner, store);

        User employee = userService.getUserById(employeeUserId);
        if (employee.getRole() != UserRole.STORE_EMPLOYEE) {
            throw new BadRequestException("User is not a store employee");
        }

        if (storeEmployeeRepository.existsByStoreIdAndUserId(storeId, employeeUserId)) {
            throw new DuplicateResourceException("Employee is already assigned to this store");
        }

        StoreEmployee storeEmployee = StoreEmployee.builder()
                .store(store)
                .user(employee)
                .build();

        storeEmployeeRepository.save(storeEmployee);
    }

    @Transactional
    public void removeEmployee(String ownerEmail, Long storeId, Long employeeUserId) {
        User owner = userService.getUserByEmail(ownerEmail);
        Store store = storeService.findStoreById(storeId);

        storeService.validateStoreAccess(owner, store);

        StoreEmployee storeEmployee = storeEmployeeRepository.findByStoreIdAndUserId(storeId, employeeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found in this store"));

        storeEmployeeRepository.delete(storeEmployee);
    }

    public List<Long> getStoreIdsForEmployee(Long userId) {
        return storeEmployeeRepository.findByUserId(userId).stream()
                .map(se -> se.getStore().getId())
                .toList();
    }
}
