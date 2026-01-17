package com.booking.dto;

import com.booking.model.Rating;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RatingDTO {
    private Long id;
    private Long raterId;
    private String raterName;
    private Long ratedUserId;
    private String ratedUserName;
    private Integer score;
    private String comment;
    private Rating.RatingType type;
    private LocalDateTime createdAt;

    public static RatingDTO fromEntity(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setId(rating.getId());
        dto.setRaterId(rating.getRater().getId());
        dto.setRaterName(rating.getRater().getFirstName() + " " + rating.getRater().getLastName());
        dto.setRatedUserId(rating.getRatedUser().getId());
        dto.setRatedUserName(rating.getRatedUser().getFirstName() + " " + rating.getRatedUser().getLastName());
        dto.setScore(rating.getScore());
        dto.setComment(rating.getComment());
        dto.setType(rating.getType());
        dto.setCreatedAt(rating.getCreatedAt());
        return dto;
    }
}


