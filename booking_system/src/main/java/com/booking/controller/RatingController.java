package com.booking.controller;

import com.booking.dto.RatingDTO;
import com.booking.dto.RatingRequestDTO;
import com.booking.model.Rating;
import com.booking.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(
            @Valid @RequestBody RatingRequestDTO request,
            @RequestParam Long raterId) {
        return ResponseEntity.ok(ratingService.createRating(request, raterId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingDTO>> getRatingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getRatingsByUser(userId));
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<RatingDTO>> getRatingsByUserAndType(
            @PathVariable Long userId,
            @PathVariable Rating.RatingType type) {
        return ResponseEntity.ok(ratingService.getRatingsByUserAndType(userId, type));
    }
}


