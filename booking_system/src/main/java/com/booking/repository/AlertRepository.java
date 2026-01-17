package com.booking.repository;

import com.booking.model.Alert;
import com.booking.model.Booking;
import com.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByUser(User user);

    List<Alert> findByBooking(Booking booking);
}
