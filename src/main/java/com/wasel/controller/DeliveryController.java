package com.wasel.controller;

import com.wasel.dto.delivery.DeliveryDto;
import com.wasel.dto.delivery.DeliveryRequestDto;
import com.wasel.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/available")
    public ResponseEntity<List<DeliveryRequestDto>> getAvailableDeliveries(Authentication authentication) {
        List<DeliveryRequestDto> deliveries = deliveryService.getAvailableDeliveries(authentication.getName());
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/my-deliveries")
    public ResponseEntity<List<DeliveryDto>> getMyDeliveries(Authentication authentication) {
        List<DeliveryDto> deliveries = deliveryService.getDriverDeliveries(authentication.getName());
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDto> getDeliveryDetails(Authentication authentication, @PathVariable Long id) {
        DeliveryDto delivery = deliveryService.getDeliveryDetails(authentication.getName(), id);
        return ResponseEntity.ok(delivery);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<DeliveryDto> acceptDelivery(Authentication authentication, @PathVariable Long id) {
        DeliveryDto delivery = deliveryService.acceptDelivery(authentication.getName(), id);
        return ResponseEntity.ok(delivery);
    }

    @PatchMapping("/{id}/pickup")
    public ResponseEntity<DeliveryDto> pickupDelivery(Authentication authentication, @PathVariable Long id) {
        DeliveryDto delivery = deliveryService.pickupDelivery(authentication.getName(), id);
        return ResponseEntity.ok(delivery);
    }

    @PatchMapping("/{id}/on-the-way")
    public ResponseEntity<DeliveryDto> startDelivery(Authentication authentication, @PathVariable Long id) {
        DeliveryDto delivery = deliveryService.startDelivery(authentication.getName(), id);
        return ResponseEntity.ok(delivery);
    }

    @PatchMapping("/{id}/deliver")
    public ResponseEntity<DeliveryDto> completeDelivery(Authentication authentication, @PathVariable Long id) {
        DeliveryDto delivery = deliveryService.completeDelivery(authentication.getName(), id);
        return ResponseEntity.ok(delivery);
    }
}
