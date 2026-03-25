package com.musclehub.backend.controller;

import com.musclehub.backend.entity.MealPlan;
import com.musclehub.backend.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meal-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        try {
            return ResponseEntity.ok(mealPlanService.getAllPlans());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberPlans(@PathVariable Long memberId) {
        try {
            return ResponseEntity.ok(mealPlanService.getMemberPlans(memberId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<?> getTrainerPlans(@PathVariable Long trainerId) {
        try {
            return ResponseEntity.ok(mealPlanService.getTrainerPlans(trainerId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public MealPlan createPlan(@RequestBody MealPlan plan,
            org.springframework.security.core.Authentication authentication) {
        return mealPlanService.createOrAssignPlan(plan, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        mealPlanService.deletePlan(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAIPlan(@RequestBody Long memberId,
            org.springframework.security.core.Authentication authentication) {
        MealPlan aiPlan = mealPlanService.triggerAiGeneration(memberId, authentication.getName());
        return ResponseEntity.ok(aiPlan);
    }
}
