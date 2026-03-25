package com.musclehub.backend.dto;

import com.musclehub.backend.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private User.Role role;
    private Boolean isActive;

    private Integer age;
    private Double height;
    private Double weight;
    private String healthDetails;
    private Integer loyaltyPoints;
    private String gender;
    private String phoneNumber;
    private String fitnessGoal;
    private String allergies;
    private Double chest;
    private Double waist;
    private Double biceps;
    private Double thighs;
    private String qualification;
    private String dietaryPreference;
    private String excludedMeatTypes;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole();
        this.age = user.getAge();
        this.height = user.getHeight();
        this.weight = user.getWeight();
        this.healthDetails = user.getHealthDetails();
        this.loyaltyPoints = user.getLoyaltyPoints();
        this.gender = user.getGender();
        this.phoneNumber = user.getPhoneNumber();
        this.fitnessGoal = user.getFitnessGoal();
        this.allergies = user.getAllergies();
        this.chest = user.getChest();
        this.waist = user.getWaist();
        this.biceps = user.getBiceps();
        this.thighs = user.getThighs();
        this.isActive = user.getIsActive();
        this.qualification = user.getQualification();
        this.dietaryPreference = user.getDietaryPreference() != null ? user.getDietaryPreference().name() : "NON_VEG";
        this.excludedMeatTypes = user.getExcludedMeatTypes();
    }
}
