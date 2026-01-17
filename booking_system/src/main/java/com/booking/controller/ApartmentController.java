package com.booking.controller;

import com.booking.dto.ApartmentDTO;
import com.booking.model.Apartment;
import com.booking.service.ApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor
public class ApartmentController {
    private final ApartmentService apartmentService;

    @GetMapping
    public ResponseEntity<List<ApartmentDTO>> getAllApartments() {
        return ResponseEntity.ok(apartmentService.getAllApartments());
    }

    @GetMapping("/available")
    public ResponseEntity<List<ApartmentDTO>> getAvailableApartments() {
        return ResponseEntity.ok(apartmentService.getAvailableApartments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartmentDTO> getApartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentService.getApartmentById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ApartmentDTO>> getApartmentsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(apartmentService.getApartmentsByOwner(ownerId));
    }

    @PostMapping
    public ResponseEntity<ApartmentDTO> createApartment(
            @RequestBody ApartmentDTO dto,
            @RequestParam Long ownerId) {
        return ResponseEntity.ok(apartmentService.createApartment(dto, ownerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApartmentDTO> updateApartmentStatus(
            @PathVariable Long id,
            @RequestParam Apartment.ApartmentStatus status,
            @RequestParam(required = false) Integer availableRooms) {
        return ResponseEntity.ok(apartmentService.updateApartmentStatus(id, status, availableRooms));
    }
}


