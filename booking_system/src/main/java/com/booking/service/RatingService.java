package com.booking.service;

import com.booking.dto.RatingDTO;
import com.booking.dto.RatingRequestDTO;
import com.booking.model.Booking;
import com.booking.model.Rating;
import com.booking.model.User;
import com.booking.repository.BookingRepository;
import com.booking.repository.RatingRepository;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public RatingDTO createRating(RatingRequestDTO request, Long raterId) {
        User rater = userRepository.findById(raterId)
                .orElseThrow(() -> new RuntimeException("Rater not found"));

        User ratedUser = userRepository.findById(request.getRatedUserId())
                .orElseThrow(() -> new RuntimeException("Rated user not found"));

        // Проверка, что пользователи связаны через бронирование
        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Проверяем, что rater и ratedUser связаны через это бронирование
            boolean isValid = false;
            if (request.getType() == Rating.RatingType.CLIENT_RATING) {
                // Владелец оценивает клиента
                isValid = booking.getApartment().getOwner().getId().equals(raterId) &&
                         booking.getClient().getId().equals(request.getRatedUserId());
            } else if (request.getType() == Rating.RatingType.OWNER_RATING) {
                // Клиент оценивает владельца
                isValid = booking.getClient().getId().equals(raterId) &&
                         booking.getApartment().getOwner().getId().equals(request.getRatedUserId());
            }
            
            if (!isValid) {
                throw new RuntimeException("Invalid rating: users must be connected through booking");
            }
        }

        Rating rating = new Rating();
        rating.setRater(rater);
        rating.setRatedUser(ratedUser);
        rating.setScore(request.getScore());
        rating.setComment(request.getComment());
        rating.setType(request.getType());
        if (request.getBookingId() != null) {
            rating.setBooking(bookingRepository.findById(request.getBookingId()).orElse(null));
        }

        Rating savedRating = ratingRepository.save(rating);
        
        // Обновляем репутацию пользователя
        updateUserReputation(ratedUser.getId());

        return RatingDTO.fromEntity(savedRating);
    }

    public List<RatingDTO> getRatingsByUser(Long userId) {
        return ratingRepository.findByRatedUserId(userId).stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RatingDTO> getRatingsByUserAndType(Long userId, Rating.RatingType type) {
        return ratingRepository.findByRatedUserIdAndType(userId, type).stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    private void updateUserReputation(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Rating> ratings = ratingRepository.findByRatedUserId(userId);
        if (!ratings.isEmpty()) {
            double average = ratings.stream()
                    .mapToInt(Rating::getScore)
                    .average()
                    .orElse(5.0);
            user.setReputationScore(average);
            user.setTotalRatings(ratings.size());
            userRepository.save(user);
        }
    }
}


