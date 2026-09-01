package com.wasel.service;

import com.wasel.entity.Driver;
import com.wasel.entity.User;
import com.wasel.enums.DriverStatus;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserService userService;

    public Driver getDriverByUserId(Long userId) {
        return driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    @Transactional
    public Driver updateDriverStatus(String email, String status) {
        User user = userService.getUserByEmail(email);
        Driver driver = getDriverByUserId(user.getId());

        DriverStatus newStatus;
        try {
            newStatus = DriverStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid driver status: " + status);
        }

        if (newStatus == DriverStatus.SUSPENDED) {
            throw new BadRequestException("Drivers cannot set themselves as suspended");
        }

        driver.setStatus(newStatus);
        return driverRepository.save(driver);
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.AVAILABLE);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }
}
