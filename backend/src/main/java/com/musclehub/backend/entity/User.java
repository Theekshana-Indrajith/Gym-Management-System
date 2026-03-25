package com.musclehub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Member Profile Fields
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

    @Column(columnDefinition = "TEXT")
    private String healthDetails;

    @Column(columnDefinition = "TEXT")
    private String qualification;

    private Integer loyaltyPoints = 0;

    private Boolean isActive = true;
    
    private Double walletBalance = 0.0;

    private String resetToken;
    private java.time.LocalDateTime tokenExpiry;
    
    @Enumerated(EnumType.STRING)
    private DietaryPreference dietaryPreference = DietaryPreference.NON_VEG;

    @Column(columnDefinition = "TEXT")
    private String excludedMeatTypes; // Comma separated: BEEF, PORK, etc.

    private java.time.LocalDate joinedDate = java.time.LocalDate.now();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @Enumerated(EnumType.STRING)
    private MembershipStatus membershipStatus = MembershipStatus.NONE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "active_package_id")
    private MembershipPackage activePackage;

    public enum Role {
        ADMIN, TRAINER, MEMBER
    }

    public enum MembershipStatus {
        NONE, PENDING, ACTIVE, EXPIRED
    }

    public enum DietaryPreference {
        VEGETARIAN, VEGAN, NON_VEG
    }
}
