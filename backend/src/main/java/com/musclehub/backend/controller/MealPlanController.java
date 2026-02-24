package com.musclehub.backend.controller;

import com.musclehub.backend.entity.MealPlan;
import com.musclehub.backend.repository.MealPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanRepository mealPlanRepository;

    @GetMapping
    public List<MealPlan> getAllPlans() {
        return mealPlanRepository.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<MealPlan> getMemberPlans(@PathVariable Long memberId) {
        return mealPlanRepository.findByMemberId(memberId);
    }

    @PostMapping
    public MealPlan createPlan(@RequestBody MealPlan plan) {
        return mealPlanRepository.save(plan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        mealPlanRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAIPlan(@RequestBody Long memberId) {
        // Mock AI Generation Logic - To be integrated with Python Model later
        MealPlan aiPlan = new MealPlan();
        aiPlan.setPlanName("AI Personalized Nutrition");
        aiPlan.setIsAiGenerated(true);
        aiPlan.setBreakfast("Oats & Fruits");
        aiPlan.setLunch("Grilled Chicken & Quinoa");
        aiPlan.setDinner("Steamed Fish & Veggies");
        aiPlan.setSnacks("Greek Yogurt & Nuts");
        aiPlan.setDailyCalories(2200.0);
        aiPlan.setDietType("Balanced (AI Optimized)");
        aiPlan.setRecommendedSupplements("Whey Protein, Multivitamins");

        return ResponseEntity.ok(aiPlan);
    }
}
