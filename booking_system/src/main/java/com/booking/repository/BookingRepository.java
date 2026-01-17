package com.booking.repository;

import com.booking.model.Booking;
import com.booking.model.Booking.BookingStatus;
import com.booking.model.User;
import com.booking.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByClient(User client);

    List<Booking> findByApartment(Apartment apartment);

    List<Booking> findByApartmentAndStatus(Apartment apartment, BookingStatus status);

    List<Booking> findByCheckInBetween(LocalDate from, LocalDate to);
}
