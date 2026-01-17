package com.booking.dto;

import com.booking.model.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Long apartmentId;
    private String apartmentTitle;
    private Long reviewerId;
    private String reviewerName;
    private Long reviewedOwnerId;
    private String reviewedOwnerName;
    private String comment;
    private Integer rating;
    private LocalDateTime createdAt;

    public static ReviewDTO fromEntity(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        if (review.getTargetApartment() != null) {
            dto.setApartmentId(review.getTargetApartment().getId());
            dto.setApartmentTitle(review.getTargetApartment().getTitle());
        }
        if (review.getAuthor() != null) {
            dto.setReviewerId(review.getAuthor().getId());
            dto.setReviewerName(review.getAuthor().getFirstName() + " " + review.getAuthor().getLastName());
        }
        if (review.getTargetUser() != null) {
            dto.setReviewedOwnerId(review.getTargetUser().getId());
            dto.setReviewedOwnerName(review.getTargetUser().getFirstName() + " " + review.getTargetUser().getLastName());
        }
        dto.setComment(review.getComment());
        dto.setRating(review.getRating());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}


