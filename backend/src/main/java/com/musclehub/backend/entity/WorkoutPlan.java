package com.musclehub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "workout_plans")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class WorkoutPlan {
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
    private String exercises;

    private String difficulty; // Beginner, Intermediate, Advanced
    private String goal; // Weight Loss, Muscle Gain, etc.

    private Boolean isAiGenerated = false;
    private LocalDate createdDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    private PlanStatus status = PlanStatus.CURRENT;

    private String planType = "MANUAL"; // MANUAL, AI_GENERATED

    public enum PlanStatus {
        CURRENT, ARCHIVED, REVIEW_PENDING
    }
}
