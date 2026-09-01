package com.wasel.controller;

import com.wasel.dto.review.CreateReviewRequest;
import com.wasel.dto.review.ReviewDto;
import com.wasel.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewDto review = reviewService.createReview(authentication.getName(), request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReviewDto> getReviewByOrder(@PathVariable Long orderId) {
        ReviewDto review = reviewService.getReviewByOrderId(orderId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<ReviewDto>> getStoreReviews(@PathVariable Long storeId) {
        List<ReviewDto> reviews = reviewService.getStoreReviews(storeId);
        return ResponseEntity.ok(reviews);
    }
}
