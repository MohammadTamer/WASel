package com.wasel.controller;

import com.wasel.entity.Driver;
import com.wasel.entity.User;
import com.wasel.service.DriverService;
import com.wasel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        Driver driver = driverService.getDriverByUserId(user.getId());

        Map<String, Object> profile = Map.of(
                "id", driver.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "status", driver.getStatus().name(),
                "rating", driver.getRating(),
                "createdAt", driver.getCreatedAt()
        );

        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/me/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {
        Driver driver = driverService.updateDriverStatus(authentication.getName(), body.get("status"));
        return ResponseEntity.ok(Map.of("status", driver.getStatus().name()));
    }
}
