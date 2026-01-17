package com.booking.repository;

import com.booking.model.Apartment;
import com.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApartmentRepository extends JpaRepository<Apartment, Long> {

    List<Apartment> findByOwner(User owner);

    List<Apartment> findByCityIgnoreCase(String city);

    List<Apartment> findByStatus(Apartment.ApartmentStatus status);
}
