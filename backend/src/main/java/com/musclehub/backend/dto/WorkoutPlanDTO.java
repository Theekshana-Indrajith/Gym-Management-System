package com.musclehub.backend.dto;

import com.musclehub.backend.entity.WorkoutPlan;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class WorkoutPlanDTO {
    private Long id;
    private String planName;
    private String exercises;
    private String difficulty;
    private String goal;
    private Boolean isAiGenerated;
    private LocalDate createdDate;

    // Member Info
    private Long memberId;
    private String memberUsername;

    // Trainer Info
    private Long trainerId;
    private String trainerUsername;

    public WorkoutPlanDTO(WorkoutPlan plan) {
        this.id = plan.getId();
        this.planName = plan.getPlanName();
        this.exercises = plan.getExercises();
        this.difficulty = plan.getDifficulty();
        this.goal = plan.getGoal();
        this.isAiGenerated = plan.getIsAiGenerated();
        this.createdDate = plan.getCreatedDate();

        if (plan.getMember() != null) {
            this.memberId = plan.getMember().getId();
            this.memberUsername = plan.getMember().getUsername();
        }

        if (plan.getTrainer() != null) {
            this.trainerId = plan.getTrainer().getId();
            this.trainerUsername = plan.getTrainer().getUsername();
        }
    }
}
