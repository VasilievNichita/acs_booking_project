package com.booking.repository;

import com.booking.model.Review;
import com.booking.model.Review.TargetType;
import com.booking.model.Apartment;
import com.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetApartment(Apartment apartment);

    List<Review> findByTargetUser(User user);

    List<Review> findByTargetTypeAndTargetUser(TargetType type, User user);
}
