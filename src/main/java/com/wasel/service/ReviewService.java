package com.wasel.service;

import com.wasel.dto.review.CreateReviewRequest;
import com.wasel.dto.review.ReviewDto;
import com.wasel.entity.*;
import com.wasel.enums.OrderStatus;
import com.wasel.exception.BadRequestException;
import com.wasel.exception.DuplicateResourceException;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.DriverRepository;
import com.wasel.repository.ReviewRepository;
import com.wasel.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final StoreRepository storeRepository;
    private final DriverRepository driverRepository;
    private final OrderService orderService;
    private final CustomerService customerService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public ReviewDto createReview(String email, CreateReviewRequest request) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());
        Order order = orderService.getOrderById(request.getOrderId());

        // Validate: only delivered orders can be reviewed
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only delivered orders can be reviewed");
        }

        // Validate: customer owns this order
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only review your own orders");
        }

        // Validate: one review per order
        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new DuplicateResourceException("This order has already been reviewed");
        }

        Review review = Review.builder()
                .order(order)
                .customer(customer)
                .storeRating(request.getStoreRating())
                .driverRating(request.getDriverRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Update store average rating
        updateStoreRating(order.getStore().getId());

        // Notify store owner
        notificationService.sendNotification(
                order.getStore().getOwner(),
                "New Store Review",
                "Customer " + customer.getUser().getName() + " rated your store " + request.getStoreRating()
                        + " ⭐ on order #" + order.getOrderNumber()
                        + (request.getComment() != null ? " (\"" + request.getComment() + "\")" : ""),
                com.wasel.enums.NotificationType.REVIEW_RECEIVED);

        // Update driver average rating & notify driver
        if (order.getDelivery() != null && order.getDelivery().getDriver() != null) {
            updateDriverRating(order.getDelivery().getDriver().getId());

            notificationService.sendNotification(
                    order.getDelivery().getDriver().getUser(),
                    "New Driver Review",
                    "Customer " + customer.getUser().getName() + " rated your delivery " + request.getDriverRating()
                            + " ⭐ on order #" + order.getOrderNumber(),
                    com.wasel.enums.NotificationType.REVIEW_RECEIVED);
        }

        return mapToDto(review);
    }

    public ReviewDto getReviewByOrderId(Long orderId) {
        Review review = reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found for this order"));
        return mapToDto(review);
    }

    public List<ReviewDto> getStoreReviews(Long storeId) {
        return reviewRepository.findByStoreId(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void updateStoreRating(Long storeId) {
        Double avgRating = reviewRepository.getAverageStoreRating(storeId);
        if (avgRating != null) {
            Store store = storeRepository.findById(storeId).orElse(null);
            if (store != null) {
                store.setRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
                storeRepository.save(store);
            }
        }
    }

    private void updateDriverRating(Long driverId) {
        Double avgRating = reviewRepository.getAverageDriverRating(driverId);
        if (avgRating != null) {
            Driver driver = driverRepository.findById(driverId).orElse(null);
            if (driver != null) {
                driver.setRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
                driverRepository.save(driver);
            }
        }
    }

    public ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .orderId(review.getOrder().getId())
                .orderNumber(review.getOrder().getOrderNumber())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getUser().getName())
                .storeRating(review.getStoreRating())
                .driverRating(review.getDriverRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
