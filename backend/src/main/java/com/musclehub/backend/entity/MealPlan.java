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
    private String breakfast;

    @Column(columnDefinition = "TEXT")
    private String lunch;

    @Column(columnDefinition = "TEXT")
    private String dinner;

    @Column(columnDefinition = "TEXT")
    private String snacks;

    private Double dailyCalories;
    private String dietType; // Keto, Vegan, High Protein

    @Column(columnDefinition = "TEXT")
    private String recommendedSupplements;

    private Boolean isAiGenerated = false;
    private LocalDate createdDate = LocalDate.now();
}
