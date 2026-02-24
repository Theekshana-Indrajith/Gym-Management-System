package com.musclehub.backend.dto;

import lombok.Data;

@Data
public class MemberProfileDTO {
    private String username;
    private String email;
    private Integer age;
    private Double height;
    private Double weight;
    private String gender;
    private String healthDetails;
    private Integer loyaltyPoints;
    private String trainerName;
    private Long trainerId;
    private String membershipStatus;
    private String activePackageName;
    private Double activePackagePrice;
    private Integer activePackageDuration;
}
