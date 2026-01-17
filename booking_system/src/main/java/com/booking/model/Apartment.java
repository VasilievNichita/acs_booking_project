package com.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "apartments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column
    private Integer rooms;

    @Column
    private Integer maxGuests;

    @Column
    private Integer totalRooms;

    @Column
    private Integer availableRooms;

    // Владелец квартиры
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Статус для онлайна/оффлайна
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApartmentStatus status = ApartmentStatus.AVAILABLE;

    private LocalDateTime createdAt;

    // Последнее обновление статуса — для кеша и оффлайна
    private LocalDateTime lastStatusUpdate;

    // Статистика
    @Builder.Default
    @Column(nullable = false)
    private double averageRating = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private int reviewsCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private int totalBookings = 0;

    @Builder.Default
    @Column(nullable = false)
    private int totalNights = 0;

    // Удобства
    @Builder.Default
    private boolean hasWifi = false;
    @Builder.Default
    private boolean hasParking = false;
    @Builder.Default
    private boolean hasKitchen = false;
    @Builder.Default
    private boolean hasAirConditioning = false;
    @Builder.Default
    private boolean hasWasher = false;
    @Builder.Default
    private boolean hasTv = false;
    @Builder.Default
    private boolean hasPool = false;
    @Builder.Default
    private boolean hasBalcony = false;

    @Column
    private Integer beds;

    @Column
    private Integer bathrooms;

    // Фото (список URL через запятую)
    @Column(length = 2000)
    private String photos;

    @Builder.Default
    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "targetApartment")
    private List<Review> reviews = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (lastStatusUpdate == null) {
            lastStatusUpdate = now;
        }
    }

    public enum ApartmentStatus {
        AVAILABLE, // свободна
        FREE,      // alias для AVAILABLE (deprecated)
        BOOKED,    // забронирована
        OCCUPIED,  // занята (check-in выполнен)
        ARCHIVED   // снята с публикации
    }
}
