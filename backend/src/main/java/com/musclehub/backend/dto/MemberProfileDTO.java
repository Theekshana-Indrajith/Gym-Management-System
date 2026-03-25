package com.musclehub.backend.dto;

import lombok.Data;

@Data
public class MemberProfileDTO {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Integer age;
    private Double height;
    private Double weight;
    private String gender;
    private String phoneNumber;
    private String fitnessGoal;
    private String allergies;
    private Double chest;
    private Double waist;
    private Double biceps;
    private Double thighs;
    private String healthDetails;
    private Integer loyaltyPoints;
    private String trainerName;
    private Long trainerId;
    private String membershipStatus;
    private String activePackageName;
    private Double activePackagePrice;
    private Integer activePackageDuration;
    private Double walletBalance;
    private String dietaryPreference;
    private String excludedMeatTypes;
}
