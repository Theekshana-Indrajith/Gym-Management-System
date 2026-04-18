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
    public ResponseEntity<?> getMemberPlans(@PathVariable Long memberId,
            org.springframework.security.core.Authentication authentication) {
        try {
            return ResponseEntity.ok(mealPlanService.getMemberPlansWithReview(memberId, authentication.getName()));
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

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivatePlan(@PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        mealPlanService.deactivatePlan(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        mealPlanService.deletePlan(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ai-generate/{memberId}")
    public ResponseEntity<?> generateAIPlan(@PathVariable Long memberId,
            @RequestBody java.util.Map<String, Object> updatedBio,
            org.springframework.security.core.Authentication authentication) {
        try {
            MealPlan aiPlan = mealPlanService.triggerAiGeneration(memberId, updatedBio, authentication.getName());
            return ResponseEntity.ok(mealPlanService.mapToMap(aiPlan));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmPlan(@PathVariable Long id,
            @RequestBody MealPlan updatedPlan,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(mealPlanService.confirmMealPlan(id, updatedPlan, authentication.getName()));
    }
}
