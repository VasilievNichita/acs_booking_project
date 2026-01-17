package com.booking.repository;

import com.booking.model.Rating;
import com.booking.model.Rating.RatingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByRatedUserId(Long userId);
    List<Rating> findByRaterId(Long raterId);
    List<Rating> findByType(RatingType type);
    List<Rating> findByRatedUserIdAndType(Long userId, RatingType type);
}


