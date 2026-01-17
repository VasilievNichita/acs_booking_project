package com.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Логин / контакт
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 200)
    private String password;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 20)
    private String phone;

    // Роль: клиент, владелец, админ
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    // Репутация (для клиентов и владельцев)
    @Builder.Default
    @Column(nullable = false)
    private double reputationScore = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private int totalRatings = 0;

    // Статистика / служебное
    private LocalDateTime createdAt;

    // Квартиры, которыми владеет пользователь
    @Builder.Default
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Apartment> apartments = new ArrayList<>();

    // Бронирования, которые он делал как клиент
    @Builder.Default
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookingsAsClient = new ArrayList<>();

    // Отзывы, которые пользователь написал
    @Builder.Default
    @OneToMany(mappedBy = "author")
    private List<Review> reviewsWritten = new ArrayList<>();

    // Отзывы про этого пользователя (как про клиента или владельца)
    @Builder.Default
    @OneToMany(mappedBy = "targetUser")
    private List<Review> reviewsReceived = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum UserRole {
        CLIENT, OWNER, ADMIN
    }
}
