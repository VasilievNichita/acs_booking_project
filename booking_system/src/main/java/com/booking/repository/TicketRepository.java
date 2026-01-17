package com.booking.repository;

import com.booking.model.Ticket;
import com.booking.model.User;
import com.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserOrderByCreatedAtDesc(User user);

    List<Ticket> findByBookingOrderByCreatedAtAsc(Booking booking);
}
