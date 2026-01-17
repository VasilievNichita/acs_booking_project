package com.booking.controller;

import com.booking.dto.ReviewDTO;
import com.booking.dto.ReviewRequestDTO;
import com.booking.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody ReviewRequestDTO request,
            @RequestParam Long reviewerId) {
        return ResponseEntity.ok(reviewService.createReview(request, reviewerId));
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(reviewService.getReviewsByApartment(apartmentId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(reviewService.getReviewsByOwner(ownerId));
    }
}


