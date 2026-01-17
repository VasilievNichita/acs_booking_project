package com.booking.controller;

import com.booking.dto.BookingDTO;
import com.booking.dto.BookingRequestDTO;
import com.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @RequestParam Long clientId) {
        return ResponseEntity.ok(bookingService.createBooking(request, clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getBookingsByClient(clientId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(bookingService.getBookingsByOwner(ownerId));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingDTO> confirmBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<BookingDTO> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<BookingDTO> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }
}


