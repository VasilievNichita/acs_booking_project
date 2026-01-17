package com.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Какая квартира
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    // Какой клиент
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    // Alias fields for DTO compatibility
    @Column(name = "check_in_date", insertable = false, updatable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", insertable = false, updatable = false)
    private LocalDate checkOutDate;

    @Column
    private Integer guests;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.CREATED;

    // Общая сумма
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Column(name = "non_refundable", nullable = false)
    private boolean nonRefundable = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean paymentRequired = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean paymentCompleted = false;

    private LocalDateTime paymentDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Оплата после check-in
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    // Тикеты по этой брони
    @Builder.Default
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> tickets = new ArrayList<>();

    // Алерты по этой брони
    @Builder.Default
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alerts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        CREATED,     // создана, но еще не подтверждена
        CONFIRMED,   // подтверждена
        CHECKED_IN,  // гость заселился
        CHECKED_OUT, // гость выехал
        COMPLETED,   // всё завершено
        CANCELLED    // отменена
    }
}
