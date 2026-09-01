package com.wasel.service;

import com.wasel.dto.auth.AuthResponse;
import com.wasel.dto.auth.LoginRequest;
import com.wasel.dto.auth.RegisterRequest;
import com.wasel.entity.Customer;
import com.wasel.entity.Driver;
import com.wasel.entity.User;
import com.wasel.enums.DriverStatus;
import com.wasel.enums.UserRole;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.DuplicateResourceException;
import com.wasel.exception.UnauthorizedException;
import com.wasel.repository.CustomerRepository;
import com.wasel.repository.DriverRepository;
import com.wasel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate unique email and phone
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        // Parse role
        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Create role-specific profile
        switch (role) {
            case CUSTOMER -> {
                Customer customer = Customer.builder()
                        .user(user)
                        .build();
                customerRepository.save(customer);
            }
            case DRIVER -> {
                Driver driver = Driver.builder()
                        .user(user)
                        .status(DriverStatus.UNAVAILABLE)
                        .build();
                driverRepository.save(driver);
            }
            default -> {
                // STORE_OWNER, STORE_EMPLOYEE, ADMIN — no separate profile table needed at registration
            }
        }

        // Generate token
        String token = generateTokenForUser(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is disabled");
        }

        String token = generateTokenForUser(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    private String generateTokenForUser(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPasswordHash(),
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

        return jwtService.generateToken(claims, userDetails);
    }
}
