package com.musclehub.backend.controller;

import com.musclehub.backend.entity.WorkoutPlan;
import com.musclehub.backend.service.WorkoutPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        try {
            return ResponseEntity.ok(workoutPlanService.getAllPlans());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberPlans(@PathVariable Long memberId) {
        try {
            return ResponseEntity.ok(workoutPlanService.getMemberPlans(memberId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<?> getTrainerPlans(@PathVariable Long trainerId) {
        try {
            return ResponseEntity.ok(workoutPlanService.getTrainerPlans(trainerId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public WorkoutPlan createPlan(@RequestBody WorkoutPlan plan,
            org.springframework.security.core.Authentication authentication) {
        return workoutPlanService.createOrAssignPlan(plan, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        workoutPlanService.deletePlan(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAIPlan(@RequestBody Long memberId,
            org.springframework.security.core.Authentication authentication) {
        WorkoutPlan aiPlan = workoutPlanService.triggerAiGeneration(memberId, authentication.getName());
        return ResponseEntity.ok(aiPlan);
    }

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@RequestBody java.util.Map<String, Object> payload,
            org.springframework.security.core.Authentication authentication) {
        java.time.LocalDate logDate = payload.containsKey("logDate") 
            ? java.time.LocalDate.parse(payload.get("logDate").toString()) 
            : java.time.LocalDate.now();
            
        workoutPlanService.logWorkoutActivity(
                authentication.getName(),
                Long.valueOf(payload.get("planId").toString()),
                payload.get("exercisesJson").toString(),
                Double.valueOf(payload.get("percentage").toString()),
                logDate);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/weekly-summary")
    public ResponseEntity<?> getWeeklySummary(
            @RequestParam(required = false) Long planId,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(workoutPlanService.getWeeklyPerformanceSummary(authentication.getName(), planId));
    }

    @GetMapping("/member/{memberId}/performance")
    public ResponseEntity<?> getMemberPerformance(
            @PathVariable Long memberId,
            @RequestParam(required = false) Long planId) {
        // Find user by id first to get username
        com.musclehub.backend.entity.User member = workoutPlanService.getUserById(memberId);
        return ResponseEntity.ok(workoutPlanService.getWeeklyPerformanceSummary(member.getUsername(), planId));
    }
}
