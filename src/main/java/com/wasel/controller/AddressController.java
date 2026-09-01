package com.wasel.controller;

import com.wasel.dto.address.AddressDto;
import com.wasel.dto.address.CreateAddressRequest;
import com.wasel.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDto>> getMyAddresses(Authentication authentication) {
        List<AddressDto> addresses = addressService.getMyAddresses(authentication.getName());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<AddressDto> createAddress(
            Authentication authentication,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        AddressDto address = addressService.createAddress(authentication.getName(), request);
        return new ResponseEntity<>(address, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDto> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        AddressDto address = addressService.updateAddress(authentication.getName(), id, request);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable Long id) {
        addressService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
