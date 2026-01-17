package com.booking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequestDTO {
    @NotNull
    private Long apartmentId;
    
    private Long reviewedOwnerId;
    
    @NotNull
    @Size(min = 10, max = 2000)
    private String comment;
    
    @NotNull
    @Min(1)
    @Max(10)
    private Integer rating;
    
    private Long bookingId;
}


