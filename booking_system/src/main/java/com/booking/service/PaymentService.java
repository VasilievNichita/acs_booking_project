package com.booking.service;

import com.booking.model.Booking;
import com.booking.model.Payment;
import com.booking.model.PaymentMethod;
import com.booking.repository.BookingRepository;
import com.booking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Transactional
    public Payment processPayment(Long bookingId, PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getPaymentCompleted()) {
            throw new RuntimeException("Payment already completed");
        }

        // Проверяем, что это после чекина
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN &&
            booking.getStatus() != Booking.BookingStatus.CHECKED_OUT) {
            throw new RuntimeException("Payment can only be processed after check-in");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(method);
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        booking.setPaymentCompleted(true);
        booking.setPaymentDate(LocalDateTime.now());
        bookingRepository.save(booking);

        // Отправляем уведомление об оплате
        notificationService.sendPaymentAlert(bookingId, 
            "Оплата успешно обработана", !booking.isNonRefundable());
        notificationService.sendBookingUpdate(bookingId, "Оплата завершена");

        return savedPayment;
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}

