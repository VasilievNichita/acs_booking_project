package com.booking.dto;

import com.booking.model.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private User.UserRole role;
    private Double reputationScore;
    private Integer totalRatings;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setReputationScore(user.getReputationScore());
        dto.setTotalRatings(user.getTotalRatings());
        return dto;
    }
}


