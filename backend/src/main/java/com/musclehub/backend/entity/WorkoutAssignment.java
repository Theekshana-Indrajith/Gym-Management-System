package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "workout_assignments")
public class WorkoutAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(columnDefinition = "TEXT")
    private String workoutContent; // Customized workout json or text

    @Column(columnDefinition = "TEXT")
    private String dietContent;

    private LocalDate assignedDate = LocalDate.now();
    private LocalDate expiryDate;
}
