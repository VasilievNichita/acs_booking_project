package com.booking.service;

import com.booking.dto.ApartmentDTO;
import com.booking.model.Apartment;
import com.booking.model.User;
import com.booking.repository.ApartmentRepository;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ApartmentDTO createApartment(ApartmentDTO dto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Apartment apartment = new Apartment();
        apartment.setTitle(dto.getTitle());
        apartment.setDescription(dto.getDescription());
        apartment.setAddress(dto.getAddress());
        apartment.setCity(dto.getCity());
        apartment.setRooms(dto.getRooms());
        apartment.setMaxGuests(dto.getMaxGuests());
        apartment.setPricePerNight(dto.getPricePerNight());
        apartment.setStatus(dto.getStatus() != null ? dto.getStatus() : Apartment.ApartmentStatus.AVAILABLE);
        apartment.setOwner(owner);
        apartment.setTotalRooms(dto.getTotalRooms());
        apartment.setAvailableRooms(dto.getAvailableRooms());
        
        // Новые поля
        apartment.setBeds(dto.getBeds());
        apartment.setBathrooms(dto.getBathrooms());
        apartment.setHasWifi(dto.isHasWifi());
        apartment.setHasParking(dto.isHasParking());
        apartment.setHasKitchen(dto.isHasKitchen());
        apartment.setHasAirConditioning(dto.isHasAirConditioning());
        apartment.setHasWasher(dto.isHasWasher());
        apartment.setHasTv(dto.isHasTv());
        apartment.setHasPool(dto.isHasPool());
        apartment.setHasBalcony(dto.isHasBalcony());
        
        if (dto.getPhotos() != null && !dto.getPhotos().isEmpty()) {
            apartment.setPhotos(String.join(",", dto.getPhotos()));
        }

        return ApartmentDTO.fromEntity(apartmentRepository.save(apartment));
    }

    public List<ApartmentDTO> getAllApartments() {
        return apartmentRepository.findAll().stream()
                .map(ApartmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ApartmentDTO> getAvailableApartments() {
        return apartmentRepository.findByStatus(Apartment.ApartmentStatus.AVAILABLE).stream()
                .map(ApartmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ApartmentDTO getApartmentById(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return ApartmentDTO.fromEntity(apartment);
    }

    public List<ApartmentDTO> getApartmentsByOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return apartmentRepository.findByOwner(owner).stream()
                .map(ApartmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApartmentDTO updateApartmentStatus(Long id, Apartment.ApartmentStatus status, Integer availableRooms) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        apartment.setStatus(status);
        if (availableRooms != null) {
            apartment.setAvailableRooms(availableRooms);
        }
        Apartment saved = apartmentRepository.save(apartment);
        
        // Отправляем обновление информации об отеле через WebSocket
        if (saved.getTotalRooms() != null && saved.getAvailableRooms() != null) {
            notificationService.sendHotelInfoUpdate(id, saved.getAvailableRooms(), saved.getTotalRooms());
        }
        notificationService.sendApartmentUpdate(id, "Статус квартиры обновлен: " + status);
        
        return ApartmentDTO.fromEntity(saved);
    }

    @Transactional
    public void updateApartmentRating(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        
        // Рейтинг обновляется через ReviewService
        apartmentRepository.save(apartment);
    }
}

