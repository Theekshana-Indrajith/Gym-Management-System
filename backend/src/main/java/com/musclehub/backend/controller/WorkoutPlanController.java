package com.musclehub.backend.controller;

import com.musclehub.backend.entity.WorkoutPlan;
import com.musclehub.backend.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanRepository workoutPlanRepository;

    @GetMapping
    public List<WorkoutPlan> getAllPlans() {
        return workoutPlanRepository.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<WorkoutPlan> getMemberPlans(@PathVariable Long memberId) {
        return workoutPlanRepository.findByMemberId(memberId);
    }

    @PostMapping
    public WorkoutPlan createPlan(@RequestBody WorkoutPlan plan) {
        return workoutPlanRepository.save(plan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        workoutPlanRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAIPlan(@RequestBody Long memberId) {
        // Mock AI Generation Logic - To be integrated with Python Model later
        // This simulates 'Step 3' of the user's request
        WorkoutPlan aiPlan = new WorkoutPlan();
        aiPlan.setPlanName("AI Recommended Routine");
        aiPlan.setIsAiGenerated(true);
        aiPlan.setExercises(
                "1. Pushups 3x15\n2. Squats 3x20\n3. Planks 3x1min\n(AI Analysis based on BMI and Health Conditions)");
        aiPlan.setGoal("Optimized Recovery & Strength");

        return ResponseEntity.ok(aiPlan);
    }
}
