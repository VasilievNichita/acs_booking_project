package com.booking.config;

import com.booking.model.Apartment;
import com.booking.model.User;
import com.booking.repository.ApartmentRepository;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Тестовые данные удалены - владельцы сами добавляют квартиры
        // Можно добавить только администратора при необходимости
    }
}


