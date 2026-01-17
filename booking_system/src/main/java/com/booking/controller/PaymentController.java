package com.booking.controller;

import com.booking.model.Payment;
import com.booking.model.PaymentMethod;
import com.booking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> processPayment(
            @PathVariable Long bookingId,
            @RequestParam PaymentMethod method) {
        return ResponseEntity.ok(paymentService.processPayment(bookingId, method));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getPaymentByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}


