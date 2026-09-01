package com.wasel.controller;

import com.wasel.dto.admin.AdminDashboardDto;
import com.wasel.dto.order.OrderSummaryDto;
import com.wasel.dto.store.StoreDto;
import com.wasel.dto.user.UserDto;
import com.wasel.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        AdminDashboardDto dashboard = adminService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDto>> getAllCustomers() {
        List<UserDto> customers = adminService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/stores")
    public ResponseEntity<List<StoreDto>> getAllStores() {
        List<StoreDto> stores = adminService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<UserDto>> getAllDrivers() {
        List<UserDto> drivers = adminService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderSummaryDto>> getAllOrders() {
        List<OrderSummaryDto> orders = adminService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserDto> toggleUserActive(@PathVariable Long id) {
        UserDto user = adminService.toggleUserActive(id);
        return ResponseEntity.ok(user);
    }
}
