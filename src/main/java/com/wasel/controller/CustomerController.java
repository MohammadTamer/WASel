package com.wasel.controller;

import com.wasel.dto.customer.CustomerDto;
import com.wasel.dto.user.UpdateProfileRequest;
import com.wasel.dto.user.UserDto;
import com.wasel.service.CustomerService;
import com.wasel.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<CustomerDto> getMyProfile(Authentication authentication) {
        CustomerDto customer = customerService.getCustomerProfile(authentication.getName());
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserDto user = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(user);
    }
}
