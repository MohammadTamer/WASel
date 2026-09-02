package com.wasel.controller;

import com.wasel.dto.store.AddEmployeeRequest;
import com.wasel.dto.store.StoreEmployeeDto;
import com.wasel.service.StoreEmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/employees")
@RequiredArgsConstructor
public class StoreEmployeeController {

    private final StoreEmployeeService storeEmployeeService;

    @GetMapping
    public ResponseEntity<List<StoreEmployeeDto>> getStoreEmployees(
            Authentication authentication,
            @PathVariable Long storeId
    ) {
        List<StoreEmployeeDto> employees = storeEmployeeService.getEmployeesByStore(authentication.getName(), storeId);
        return ResponseEntity.ok(employees);
    }

    @PostMapping
    public ResponseEntity<StoreEmployeeDto> addEmployee(
            Authentication authentication,
            @PathVariable Long storeId,
            @Valid @RequestBody AddEmployeeRequest request
    ) {
        StoreEmployeeDto employee = storeEmployeeService.addEmployeeByEmail(
                authentication.getName(),
                storeId,
                request.getEmail()
        );
        return new ResponseEntity<>(employee, HttpStatus.CREATED);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeEmployee(
            Authentication authentication,
            @PathVariable Long storeId,
            @PathVariable Long userId
    ) {
        storeEmployeeService.removeEmployee(authentication.getName(), storeId, userId);
        return ResponseEntity.noContent().build();
    }
}
