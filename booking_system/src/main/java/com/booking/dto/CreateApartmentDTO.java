package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateApartmentDTO {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotBlank
    private String address;
    
    @NotBlank
    private String city;
    
    @NotNull
    @Positive
    private BigDecimal pricePerNight;
    
    private Integer rooms;
    private Integer maxGuests;
    private Integer beds;
    private Integer bathrooms;
    
    // Удобства
    private boolean hasWifi;
    private boolean hasParking;
    private boolean hasKitchen;
    private boolean hasAirConditioning;
    private boolean hasWasher;
    private boolean hasTv;
    private boolean hasPool;
    private boolean hasBalcony;
    
    // Фото (список URL)
    private List<String> photos;
    
    // ID владельца
    @NotNull
    private Long ownerId;
}
