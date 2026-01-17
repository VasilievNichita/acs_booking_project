package com.booking.service;

import com.booking.dto.ReviewDTO;
import com.booking.dto.ReviewRequestDTO;
import com.booking.model.Apartment;
import com.booking.model.Booking;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.repository.ApartmentRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.ReviewRepository;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public ReviewDTO createReview(ReviewRequestDTO request, Long reviewerId) {
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        // Проверка, что пользователь действительно бронировал эту квартиру
        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (!booking.getClient().getId().equals(reviewerId) || 
                !booking.getApartment().getId().equals(request.getApartmentId())) {
                throw new RuntimeException("Invalid booking for review");
            }
        }

        User reviewedOwner = null;
        if (request.getReviewedOwnerId() != null) {
            reviewedOwner = userRepository.findById(request.getReviewedOwnerId())
                    .orElseThrow(() -> new RuntimeException("Reviewed owner not found"));
        } else {
            reviewedOwner = apartment.getOwner();
        }

        Review review = new Review();
        review.setTargetApartment(apartment);
        review.setAuthor(reviewer);
        review.setTargetUser(reviewedOwner);
        review.setTargetType(Review.TargetType.PROPERTY);
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        // Note: Review model doesn't have booking field based on the entity

        Review savedReview = reviewRepository.save(review);
        
        // Обновляем рейтинг квартиры
        updateApartmentRating(apartment.getId());
        
        // Обновляем репутацию владельца
        if (reviewedOwner != null) {
            updateOwnerReputation(reviewedOwner.getId());
        }

        return ReviewDTO.fromEntity(savedReview);
    }

    public List<ReviewDTO> getReviewsByApartment(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return reviewRepository.findByTargetApartment(apartment).stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return reviewRepository.findByTargetUser(owner).stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    private void updateApartmentRating(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        
        List<Review> reviews = reviewRepository.findByTargetApartment(apartment);
        if (!reviews.isEmpty()) {
            double average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            apartment.setAverageRating(average);
            apartment.setReviewsCount(reviews.size());
            apartmentRepository.save(apartment);
        }
    }

    @Transactional
    private void updateOwnerReputation(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        
        List<Review> reviews = reviewRepository.findByTargetUser(owner);
        if (!reviews.isEmpty()) {
            double average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(5.0);
            owner.setReputationScore(average);
            owner.setTotalRatings(reviews.size());
            userRepository.save(owner);
        }
    }
}


