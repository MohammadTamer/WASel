package com.wasel.service;

import com.wasel.dto.admin.AdminDashboardDto;
import com.wasel.dto.order.OrderSummaryDto;
import com.wasel.dto.store.StoreDto;
import com.wasel.dto.user.UserDto;
import com.wasel.entity.User;
import com.wasel.enums.OrderStatus;
import com.wasel.enums.UserRole;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.OrderRepository;
import com.wasel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    private final StoreService storeService;
    private final DriverService driverService;
    private final UserService userService;

    public AdminDashboardDto getDashboard() {
        long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);
        long totalStores = userRepository.countByRole(UserRole.STORE_OWNER);
        long totalDrivers = userRepository.countByRole(UserRole.DRIVER);

        long activeOrders = orderRepository.countByStatus(OrderStatus.PENDING)
                + orderRepository.countByStatus(OrderStatus.ACCEPTED)
                + orderRepository.countByStatus(OrderStatus.PREPARING)
                + orderRepository.countByStatus(OrderStatus.READY)
                + orderRepository.countByStatus(OrderStatus.ASSIGNED)
                + orderRepository.countByStatus(OrderStatus.PICKED_UP)
                + orderRepository.countByStatus(OrderStatus.ON_THE_WAY);

        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED)
                + orderRepository.countByStatus(OrderStatus.REJECTED);
        long totalOrders = orderRepository.count();

        return AdminDashboardDto.builder()
                .totalCustomers(totalCustomers)
                .totalStores(totalStores)
                .totalDrivers(totalDrivers)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .totalOrders(totalOrders)
                .build();
    }

    public List<UserDto> getAllCustomers() {
        return userRepository.findByRole(UserRole.CUSTOMER).stream()
                .map(userService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<StoreDto> getAllStores() {
        return storeService.getAllStores();
    }

    public List<UserDto> getAllDrivers() {
        return userRepository.findByRole(UserRole.DRIVER).stream()
                .map(userService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<OrderSummaryDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> OrderSummaryDto.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .storeName(order.getStore().getName())
                        .status(order.getStatus().name())
                        .totalAmount(order.getTotalAmount())
                        .createdAt(order.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Cannot disable admin accounts");
        }

        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);
        return userService.mapToDto(user);
    }
}
