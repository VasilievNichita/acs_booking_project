package com.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequestDTO {
    @NotNull
    private Long apartmentId;
    
    @NotNull
    private LocalDate checkInDate;
    
    @NotNull
    private LocalDate checkOutDate;
    
    @NotNull
    private Integer guests;
}


