package com.wasel.controller;

import com.wasel.dto.order.*;
import com.wasel.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderDto order = orderService.createOrder(authentication.getName(), request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderSummaryDto>> getMyOrders(Authentication authentication) {
        List<OrderSummaryDto> orders = orderService.getCustomerOrders(authentication.getName());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/store-orders/{storeId}")
    public ResponseEntity<List<OrderSummaryDto>> getStoreOrders(
            Authentication authentication,
            @PathVariable Long storeId
    ) {
        List<OrderSummaryDto> orders = orderService.getStoreOrders(authentication.getName(), storeId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderDetails(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.getOrderDetails(authentication.getName(), id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<OrderDto> acceptOrder(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.acceptOrder(authentication.getName(), id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<OrderDto> rejectOrder(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        OrderDto order = orderService.rejectOrder(authentication.getName(), id, body.get("reason"));
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/prepare")
    public ResponseEntity<OrderDto> prepareOrder(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.prepareOrder(authentication.getName(), id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/ready")
    public ResponseEntity<OrderDto> markOrderReady(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.markOrderReady(authentication.getName(), id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        OrderDto order = orderService.cancelOrder(authentication.getName(), id, request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<OrderDto> reorder(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.reorder(authentication.getName(), id);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }
}
