package com.booking.dto;

import com.booking.model.Apartment;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Data
public class ApartmentDTO {
    private Long id;
    private String title;
    private String description;
    private String address;
    private String city;
    private Integer rooms;
    private Integer maxGuests;
    private BigDecimal pricePerNight;
    private Apartment.ApartmentStatus status;
    private Double averageRating;
    private Integer totalReviews;
    private Long ownerId;
    private String ownerName;
    private Integer totalRooms;
    private Integer availableRooms;
    
    // Новые поля
    private Integer beds;
    private Integer bathrooms;
    private boolean hasWifi;
    private boolean hasParking;
    private boolean hasKitchen;
    private boolean hasAirConditioning;
    private boolean hasWasher;
    private boolean hasTv;
    private boolean hasPool;
    private boolean hasBalcony;
    private List<String> photos;

    public static ApartmentDTO fromEntity(Apartment apartment) {
        ApartmentDTO dto = new ApartmentDTO();
        dto.setId(apartment.getId());
        dto.setTitle(apartment.getTitle());
        dto.setDescription(apartment.getDescription());
        dto.setAddress(apartment.getAddress());
        dto.setCity(apartment.getCity());
        dto.setRooms(apartment.getRooms());
        dto.setMaxGuests(apartment.getMaxGuests());
        dto.setPricePerNight(apartment.getPricePerNight());
        dto.setStatus(apartment.getStatus());
        dto.setAverageRating(apartment.getAverageRating());
        dto.setTotalReviews(apartment.getReviewsCount());
        dto.setOwnerId(apartment.getOwner().getId());
        dto.setOwnerName(apartment.getOwner().getFirstName() + " " + apartment.getOwner().getLastName());
        dto.setTotalRooms(apartment.getTotalRooms());
        dto.setAvailableRooms(apartment.getAvailableRooms());
        
        // Новые поля
        dto.setBeds(apartment.getBeds());
        dto.setBathrooms(apartment.getBathrooms());
        dto.setHasWifi(apartment.isHasWifi());
        dto.setHasParking(apartment.isHasParking());
        dto.setHasKitchen(apartment.isHasKitchen());
        dto.setHasAirConditioning(apartment.isHasAirConditioning());
        dto.setHasWasher(apartment.isHasWasher());
        dto.setHasTv(apartment.isHasTv());
        dto.setHasPool(apartment.isHasPool());
        dto.setHasBalcony(apartment.isHasBalcony());
        
        if (apartment.getPhotos() != null && !apartment.getPhotos().isEmpty()) {
            dto.setPhotos(Arrays.asList(apartment.getPhotos().split(",")));
        }
        
        return dto;
    }
}


