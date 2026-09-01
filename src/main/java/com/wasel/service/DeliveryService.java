package com.wasel.service;

import com.wasel.dto.delivery.DeliveryDto;
import com.wasel.dto.delivery.DeliveryRequestDto;
import com.wasel.entity.Delivery;
import com.wasel.entity.Driver;
import com.wasel.entity.Order;
import com.wasel.entity.User;
import com.wasel.enums.DeliveryStatus;
import com.wasel.enums.DriverStatus;
import com.wasel.enums.NotificationType;
import com.wasel.enums.OrderStatus;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.DeliveryRepository;
import com.wasel.repository.DriverRepository;
import com.wasel.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final DriverService driverService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public Delivery createDelivery(Order order) {
        Delivery delivery = Delivery.builder()
                .order(order)
                .status(DeliveryStatus.PENDING)
                .build();
        return deliveryRepository.save(delivery);
    }

    public List<DeliveryRequestDto> getAvailableDeliveries(String email) {
        return deliveryRepository.findByStatus(DeliveryStatus.PENDING).stream()
                .map(this::mapToRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryDto acceptDelivery(String email, Long deliveryId) {
        User user = userService.getUserByEmail(email);
        Driver driver = driverService.getDriverByUserId(user.getId());
        Delivery delivery = getDeliveryById(deliveryId);

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new BadRequestException("This delivery is no longer available");
        }

        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BadRequestException("You must be available to accept deliveries");
        }

        // Assign driver to delivery
        delivery.setDriver(driver);
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(LocalDateTime.now());
        delivery = deliveryRepository.save(delivery);

        // Update order status
        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.ASSIGNED);
        orderRepository.save(order);

        // Update driver status
        driver.setStatus(DriverStatus.BUSY);
        driverRepository.save(driver);

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Driver Assigned",
                "Captain " + driver.getUser().getName() + " has accepted to deliver your order #" + order.getOrderNumber(),
                NotificationType.DRIVER_ASSIGNED
        );

        // Notify store
        notificationService.sendNotification(
                order.getStore().getOwner(),
                "Driver Assigned",
                "Captain " + driver.getUser().getName() + " accepted delivery for order #" + order.getOrderNumber(),
                NotificationType.DRIVER_ASSIGNED
        );

        return mapToDto(delivery);
    }

    @Transactional
    public DeliveryDto pickupDelivery(String email, Long deliveryId) {
        User user = userService.getUserByEmail(email);
        Delivery delivery = getDeliveryById(deliveryId);

        validateDriverAccess(user, delivery);

        if (delivery.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new BadRequestException("Delivery must be assigned before pickup");
        }

        delivery.setStatus(DeliveryStatus.PICKED_UP);
        delivery.setPickedUpAt(LocalDateTime.now());
        delivery = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.PICKED_UP);
        orderRepository.save(order);

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order Picked Up",
                "Captain " + user.getName() + " picked up your order #" + order.getOrderNumber() + " from " + order.getStore().getName(),
                NotificationType.ORDER_PICKED_UP
        );

        // Notify store
        notificationService.sendNotification(
                order.getStore().getOwner(),
                "Order Picked Up",
                "Order #" + order.getOrderNumber() + " was picked up by driver " + user.getName(),
                NotificationType.ORDER_PICKED_UP
        );

        return mapToDto(delivery);
    }

    @Transactional
    public DeliveryDto startDelivery(String email, Long deliveryId) {
        User user = userService.getUserByEmail(email);
        Delivery delivery = getDeliveryById(deliveryId);

        validateDriverAccess(user, delivery);

        if (delivery.getStatus() != DeliveryStatus.PICKED_UP) {
            throw new BadRequestException("Order must be picked up before starting delivery");
        }

        delivery.setStatus(DeliveryStatus.ON_THE_WAY);
        delivery = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.ON_THE_WAY);
        orderRepository.save(order);

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order On The Way",
                "Captain " + user.getName() + " is heading to your address with order #" + order.getOrderNumber() + " 🚀",
                NotificationType.ORDER_ON_THE_WAY
        );

        return mapToDto(delivery);
    }

    @Transactional
    public DeliveryDto completeDelivery(String email, Long deliveryId) {
        User user = userService.getUserByEmail(email);
        Delivery delivery = getDeliveryById(deliveryId);

        validateDriverAccess(user, delivery);

        if (delivery.getStatus() != DeliveryStatus.ON_THE_WAY) {
            throw new BadRequestException("Delivery must be on the way before completing");
        }

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setDeliveredAt(LocalDateTime.now());
        delivery = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        // Release driver
        Driver driver = delivery.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order Delivered",
                "Your order #" + order.getOrderNumber() + " has been delivered! Enjoy your meal 🎉 You can rate your experience now.",
                NotificationType.ORDER_DELIVERED
        );

        // Notify store owner
        notificationService.sendNotification(
                order.getStore().getOwner(),
                "Order Delivered",
                "Order #" + order.getOrderNumber() + " has been successfully delivered by " + user.getName() + " 🎉",
                NotificationType.ORDER_DELIVERED
        );

        // Notify driver
        notificationService.sendNotification(
                user,
                "Delivery Completed",
                "Delivery completed for order #" + order.getOrderNumber() + "! Earned +" + order.getDeliveryFee() + " EGP 🎉",
                NotificationType.ORDER_DELIVERED
        );

        return mapToDto(delivery);
    }

    @Transactional
    public void cancelDelivery(Long deliveryId) {
        Delivery delivery = getDeliveryById(deliveryId);
        delivery.setStatus(DeliveryStatus.CANCELLED);

        // Release driver if assigned
        if (delivery.getDriver() != null) {
            Driver driver = delivery.getDriver();
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        deliveryRepository.save(delivery);
    }

    public List<DeliveryDto> getDriverDeliveries(String email) {
        User user = userService.getUserByEmail(email);
        Driver driver = driverService.getDriverByUserId(user.getId());

        return deliveryRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeliveryDto getDeliveryDetails(String email, Long deliveryId) {
        Delivery delivery = getDeliveryById(deliveryId);
        return mapToDto(delivery);
    }

    public Delivery getDeliveryById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + id));
    }

    private void validateDriverAccess(User user, Delivery delivery) {
        if (delivery.getDriver() == null || !delivery.getDriver().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not assigned to this delivery");
        }
    }

    public DeliveryDto mapToDto(Delivery delivery) {
        Order order = delivery.getOrder();
        return DeliveryDto.builder()
                .id(delivery.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .driverId(delivery.getDriver() != null ? delivery.getDriver().getId() : null)
                .driverName(delivery.getDriver() != null ? delivery.getDriver().getUser().getName() : null)
                .status(delivery.getStatus().name())
                .storeName(order.getStore().getName())
                .storeAddress(order.getStore().getAddress())
                .customerAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress().getAddressLine() : "")
                .deliveryFee(order.getDeliveryFee())
                .assignedAt(delivery.getAssignedAt())
                .pickedUpAt(delivery.getPickedUpAt())
                .deliveredAt(delivery.getDeliveredAt())
                .failureReason(delivery.getFailureReason())
                .createdAt(delivery.getCreatedAt())
                .build();
    }

    private DeliveryRequestDto mapToRequestDto(Delivery delivery) {
        Order order = delivery.getOrder();
        return DeliveryRequestDto.builder()
                .deliveryId(delivery.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .storeName(order.getStore().getName())
                .storeAddress(order.getStore().getAddress())
                .customerArea(order.getAddress().getCity())
                .deliveryFee(order.getDeliveryFee())
                .itemCount(order.getOrderItems().size())
                .build();
    }
}
