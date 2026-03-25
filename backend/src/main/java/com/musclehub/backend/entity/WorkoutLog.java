package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id")
    private WorkoutPlan workoutPlan;

    private LocalDate date = LocalDate.now();
    
    @Column(columnDefinition = "TEXT")
    private String completedExercises; // JSON String: [{"exerciseName": "...", "completed": true, "weight": 20}]

    private Double completionPercentage;
}
