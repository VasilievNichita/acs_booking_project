package com.booking.dto;

import com.booking.model.Rating;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingRequestDTO {
    @NotNull
    private Long ratedUserId;
    
    @NotNull
    @Min(1)
    @Max(10)
    private Integer score;
    
    private String comment;
    
    private Long bookingId;
    
    @NotNull
    private Rating.RatingType type;
}


