package com.wasel.service;

import com.wasel.dto.address.AddressDto;
import com.wasel.dto.delivery.DeliveryDto;
import com.wasel.dto.order.*;
import com.wasel.entity.*;
import com.wasel.enums.*;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.OrderItemRepository;
import com.wasel.repository.OrderRepository;
import com.wasel.repository.ProductRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerService customerService;
    private final StoreService storeService;
    private final AddressService addressService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final DeliveryService deliveryService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            CustomerService customerService,
            StoreService storeService,
            AddressService addressService,
            UserService userService,
            NotificationService notificationService,
            @Lazy DeliveryService deliveryService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerService = customerService;
        this.storeService = storeService;
        this.addressService = addressService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.deliveryService = deliveryService;
    }

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(
            OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY
    );

    @Transactional
    public OrderDto createOrder(String email, CreateOrderRequest request) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());

        // Validate store is open
        Store store = storeService.findStoreById(request.getStoreId());
        if (store.getStatus() != StoreStatus.OPEN) {
            throw new BadRequestException("Store is not currently accepting orders");
        }

        // Validate address belongs to customer
        Address address = addressService.getAddressById(request.getAddressId());
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("Address does not belong to you");
        }

        // Create order
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .store(store)
                .address(address)
                .status(OrderStatus.PENDING)
                .deliveryFee(store.getDeliveryFee())
                .build();

        // Process items and calculate subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            if (!product.getStore().getId().equals(store.getId())) {
                throw new BadRequestException("Product '" + product.getName() + "' does not belong to this store");
            }

            if (!product.getIsAvailable()) {
                throw new BadRequestException("Product '" + product.getName() + "' is currently unavailable");
            }

            BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .totalPrice(totalPrice)
                    .build();

            orderItems.add(orderItem);
            subtotal = subtotal.add(totalPrice);
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getDeliveryFee()));
        order.setOrderItems(orderItems);

        order = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        // Notify store
        notificationService.sendNotification(
                store.getOwner(),
                "New Order",
                "New order #" + order.getOrderNumber() + " received (" + order.getTotalAmount() + " EGP)",
                NotificationType.ORDER_CREATED
        );

        // Notify customer
        notificationService.sendNotification(
                customer.getUser(),
                "Order Placed",
                "Your order #" + order.getOrderNumber() + " has been placed successfully and sent to " + store.getName(),
                NotificationType.ORDER_CREATED
        );

        return mapToDto(order);
    }

    @Transactional
    public OrderDto acceptOrder(String email, Long orderId) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);
        storeService.validateStoreAccess(user, order.getStore());

        validateStatusTransition(order, OrderStatus.ACCEPTED);
        order.setStatus(OrderStatus.ACCEPTED);
        order = orderRepository.save(order);

        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order Accepted",
                "Store " + order.getStore().getName() + " accepted your order #" + order.getOrderNumber(),
                NotificationType.ORDER_ACCEPTED
        );

        return mapToDto(order);
    }

    @Transactional
    public OrderDto rejectOrder(String email, Long orderId, String reason) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);
        storeService.validateStoreAccess(user, order.getStore());

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setCancellationReason(reason);
        order = orderRepository.save(order);

        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order Rejected",
                "Store " + order.getStore().getName() + " rejected order #" + order.getOrderNumber() + (reason != null ? ": " + reason : ""),
                NotificationType.ORDER_REJECTED
        );

        return mapToDto(order);
    }

    @Transactional
    public OrderDto prepareOrder(String email, Long orderId) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);
        storeService.validateStoreAccess(user, order.getStore());

        validateStatusTransition(order, OrderStatus.PREPARING);
        order.setStatus(OrderStatus.PREPARING);
        order = orderRepository.save(order);

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order In Kitchen",
                "The kitchen started cooking your order #" + order.getOrderNumber(),
                NotificationType.ORDER_PREPARING
        );

        return mapToDto(order);
    }

    @Transactional
    public OrderDto markOrderReady(String email, Long orderId) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);
        storeService.validateStoreAccess(user, order.getStore());

        validateStatusTransition(order, OrderStatus.READY);
        order.setStatus(OrderStatus.READY);
        order = orderRepository.save(order);

        // Create delivery record
        deliveryService.createDelivery(order);

        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Order Ready",
                "Your order #" + order.getOrderNumber() + " is ready and waiting for driver pickup",
                NotificationType.ORDER_READY
        );

        return mapToDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(String email, Long orderId, CancelOrderRequest request) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);

        // Customer can cancel their own orders; store can cancel their orders
        boolean isCustomer = order.getCustomer().getUser().getId().equals(user.getId());
        boolean isStore = false;
        try {
            storeService.validateStoreAccess(user, order.getStore());
            isStore = true;
        } catch (ForbiddenException ignored) {}

        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isCustomer && !isStore && !isAdmin) {
            throw new ForbiddenException("You do not have permission to cancel this order");
        }

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled in its current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason());
        order = orderRepository.save(order);

        // Cancel delivery if exists
        if (order.getDelivery() != null) {
            deliveryService.cancelDelivery(order.getDelivery().getId());
        }

        // Notify relevant parties
        if (!isCustomer) {
            notificationService.sendNotification(
                    order.getCustomer().getUser(),
                    "Order Cancelled",
                    "Your order #" + order.getOrderNumber() + " has been cancelled",
                    NotificationType.ORDER_CANCELLED
            );
        }

        if (!isStore) {
            notificationService.sendNotification(
                    order.getStore().getOwner(),
                    "Order Cancelled",
                    "Order #" + order.getOrderNumber() + " has been cancelled by customer",
                    NotificationType.ORDER_CANCELLED
            );
        }

        return mapToDto(order);
    }

    @Transactional
    public OrderDto reorder(String email, Long orderId) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());
        Order originalOrder = getOrderById(orderId);

        if (!originalOrder.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only reorder your own orders");
        }

        Store store = originalOrder.getStore();
        if (store.getStatus() != StoreStatus.OPEN) {
            throw new BadRequestException("Store is not currently accepting orders");
        }

        // Build items from original order
        List<CreateOrderRequest.OrderItemRequest> itemRequests = new ArrayList<>();
        for (OrderItem item : originalOrder.getOrderItems()) {
            itemRequests.add(CreateOrderRequest.OrderItemRequest.builder()
                    .productId(item.getProduct().getId())
                    .quantity(item.getQuantity())
                    .build());
        }

        CreateOrderRequest request = CreateOrderRequest.builder()
                .storeId(store.getId())
                .addressId(originalOrder.getAddress().getId())
                .items(itemRequests)
                .build();

        return createOrder(email, request);
    }

    public List<OrderSummaryDto> getCustomerOrders(String email) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<OrderSummaryDto> getStoreOrders(String email, Long storeId) {
        User user = userService.getUserByEmail(email);
        Store store = storeService.findStoreById(storeId);
        storeService.validateStoreAccess(user, store);

        return orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderDetails(String email, Long orderId) {
        User user = userService.getUserByEmail(email);
        Order order = getOrderById(orderId);

        // Validate access: customer, store, assigned driver, or admin
        boolean hasAccess = user.getRole() == UserRole.ADMIN
                || order.getCustomer().getUser().getId().equals(user.getId());

        if (!hasAccess) {
            try {
                storeService.validateStoreAccess(user, order.getStore());
                hasAccess = true;
            } catch (ForbiddenException ignored) {}
        }

        if (!hasAccess && order.getDelivery() != null && order.getDelivery().getDriver() != null) {
            hasAccess = order.getDelivery().getDriver().getUser().getId().equals(user.getId());
        }

        if (!hasAccess) {
            throw new ForbiddenException("You do not have access to this order");
        }

        return mapToDto(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    // ── Status Transition Validation ──

    private void validateStatusTransition(Order order, OrderStatus newStatus) {
        OrderStatus current = order.getStatus();
        boolean valid = switch (newStatus) {
            case ACCEPTED -> current == OrderStatus.PENDING;
            case PREPARING -> current == OrderStatus.ACCEPTED;
            case READY -> current == OrderStatus.PREPARING;
            case ASSIGNED -> current == OrderStatus.READY;
            case PICKED_UP -> current == OrderStatus.ASSIGNED;
            case ON_THE_WAY -> current == OrderStatus.PICKED_UP;
            case DELIVERED -> current == OrderStatus.ON_THE_WAY;
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Cannot transition from " + current + " to " + newStatus
            );
        }
    }

    // ── Order Number Generation ──

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "WS-" + timestamp + "-" + random;
    }

    // ── DTO Mapping ──

    public OrderDto mapToDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        AddressDto addressDto = addressService.mapToDto(order.getAddress());

        DeliveryDto deliveryDto = null;
        if (order.getDelivery() != null) {
            deliveryDto = deliveryService.mapToDto(order.getDelivery());
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getUser().getName())
                .storeId(order.getStore().getId())
                .storeName(order.getStore().getName())
                .address(addressDto)
                .status(order.getStatus().name())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .cancellationReason(order.getCancellationReason())
                .items(items)
                .delivery(deliveryDto)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderSummaryDto mapToSummaryDto(Order order) {
        return OrderSummaryDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .storeName(order.getStore().getName())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
