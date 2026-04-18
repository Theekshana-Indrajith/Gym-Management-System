package com.musclehub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "meal_plans")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MealPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

    private String planName;

    @Column(columnDefinition = "TEXT")
    private String meals; // Breakfast, Lunch, Dinner, Snacks

    private Double dailyCalories;
    private String dietType; // Keto, Vegan, High Protein
    @Column(columnDefinition = "TEXT")
    private String goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplement_id")
    private Supplement recommendedSupplement;

    private String supplementDosage;

    private Boolean isAiGenerated = false;
    private Boolean isActive = true;
    private Boolean isReviewPending = false;

    private LocalDate createdDate = LocalDate.now();
}
