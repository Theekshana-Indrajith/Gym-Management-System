package com.musclehub.backend.service;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.MealPlan;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.MealPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPlans() {
        return mealPlanRepository.findAllWithDetails().stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMemberPlans(Long memberId) {
        return mealPlanRepository.findByMemberIdWithDetails(memberId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTrainerPlans(Long trainerId) {
        return mealPlanRepository.findByTrainerIdWithDetails(trainerId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapToMap(MealPlan plan) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", plan.getId());
        map.put("planName", plan.getPlanName());
        map.put("meals", plan.getMeals());
        map.put("dailyCalories", plan.getDailyCalories());
        map.put("dietType", plan.getDietType());
        map.put("goal", plan.getGoal());
        map.put("isAiGenerated", plan.getIsAiGenerated());
        map.put("isActive", plan.getIsActive());
        map.put("createdDate", plan.getCreatedDate() != null ? plan.getCreatedDate().toString() : null);

        if (plan.getMember() != null) {
            map.put("memberId", plan.getMember().getId());
            map.put("memberUsername", plan.getMember().getUsername());
        }

        if (plan.getTrainer() != null) {
            map.put("trainerId", plan.getTrainer().getId());
            map.put("trainerUsername", plan.getTrainer().getUsername());
        }

        if (plan.getRecommendedSupplement() != null) {
            map.put("supplementId", plan.getRecommendedSupplement().getId());
            map.put("supplementName", plan.getRecommendedSupplement().getName());
            map.put("supplementStock", plan.getRecommendedSupplement().getStock());
            map.put("supplementDosage", plan.getSupplementDosage());
        }

        return map;
    }

    @Transactional
    public MealPlan createOrAssignPlan(MealPlan plan, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can manage meal plans");
        }

        if (plan.getMember() == null || plan.getMember().getId() == null) {
            throw new RuntimeException("Valid Member ID required for diet plan assignment");
        }

        // Deactivate old plans
        List<MealPlan> oldPlans = mealPlanRepository.findByMemberIdWithDetails(plan.getMember().getId());
        for (MealPlan op : oldPlans) {
            op.setIsActive(false);
        }
        mealPlanRepository.saveAll(oldPlans);

        plan.setTrainer(trainer);
        plan.setIsActive(true);
        return mealPlanRepository.save(plan);
    }

    public void deletePlan(Long id, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can delete meal plans");
        }

        mealPlanRepository.deleteById(id);
    }

    public MealPlan triggerAiGeneration(Long memberId, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER) {
            throw new RuntimeException("Only trainers can trigger AI generation");
        }

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Placeholder for AI Logic
        MealPlan aiPlan = new MealPlan();
        aiPlan.setMember(member);
        aiPlan.setTrainer(trainer);
        aiPlan.setPlanName("AI Personalized: " + member.getUsername());
        aiPlan.setIsAiGenerated(true);
        aiPlan.setMeals(
                "Breakfast: AI Optimized Protein Shake\nLunch: Superfood Salad\nDinner: Lean Protein & Veggie Mix");
        aiPlan.setDietType("ADAPTIVE (AI)");
        aiPlan.setDailyCalories(2500.0);
        aiPlan.setGoal("AI Recommended Optimization");

        return mealPlanRepository.save(aiPlan);
    }
}
