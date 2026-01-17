package com.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Одна бронь — один платёж
    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Комиссия сайта (10%)
    @Column(precision = 10, scale = 2)
    private BigDecimal platformFee;

    // Сумма владельцу (90%)
    @Column(precision = 10, scale = 2)
    private BigDecimal ownerAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod = PaymentMethod.CREDIT_CARD;

    public enum PaymentStatus {
        PENDING,   // ждём оплаты
        PAID,      // оплачено
        FAILED,    // ошибка
        REFUNDED   // возвращено
    }
}
