package com.musclehub.backend.dto;

import com.musclehub.backend.entity.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private User.Role role;

    private Integer age;
    private Double height;
    private Double weight;
    private String healthDetails;
    private Integer loyaltyPoints;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.age = user.getAge();
        this.height = user.getHeight();
        this.weight = user.getWeight();
        this.healthDetails = user.getHealthDetails();
        this.loyaltyPoints = user.getLoyaltyPoints();
    }
}
