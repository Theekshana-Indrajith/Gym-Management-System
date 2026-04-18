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
    public List<Map<String, Object>> getMemberPlansWithReview(Long memberId, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<MealPlan> allPlans = mealPlanRepository.findByMemberIdWithDetails(memberId);
        
        if (requester.getRole() == User.Role.MEMBER && requester.getId().equals(memberId)) {
            return allPlans.stream()
                    .filter(p -> !Boolean.TRUE.equals(p.getIsReviewPending()))
                    .map(this::mapToMap)
                    .collect(Collectors.toList());
        }
        
        return allPlans.stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTrainerPlans(Long trainerId) {
        return mealPlanRepository.findByTrainerIdWithDetails(trainerId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> mapToMap(MealPlan plan) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", plan.getId());
        map.put("planName", plan.getPlanName());
        map.put("meals", plan.getMeals());
        map.put("dailyCalories", plan.getDailyCalories());
        map.put("dietType", plan.getDietType());
        map.put("goal", plan.getGoal());
        map.put("isAiGenerated", plan.getIsAiGenerated());
        map.put("isActive", plan.getIsActive());
        map.put("isReviewPending", plan.getIsReviewPending());
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

    @Transactional
    public void deactivatePlan(Long id, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can manage meal plans");
        }

        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));
        
        plan.setIsActive(false);
        mealPlanRepository.save(plan);
    }

    public void deletePlan(Long id, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can delete meal plans");
        }

        mealPlanRepository.deleteById(id);
    }

    @Transactional
    public MealPlan triggerAiGeneration(Long memberId, Map<String, Object> updatedBio, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER) {
            throw new RuntimeException("Only trainers can trigger AI generation");
        }

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Update Member Bio-data if provided
        if (updatedBio != null) {
            if (updatedBio.containsKey("age") && updatedBio.get("age") != null) member.setAge(Integer.parseInt(updatedBio.get("age").toString()));
            if (updatedBio.containsKey("weight") && updatedBio.get("weight") != null) member.setWeight(Double.parseDouble(updatedBio.get("weight").toString()));
            if (updatedBio.containsKey("height") && updatedBio.get("height") != null) member.setHeight(Double.parseDouble(updatedBio.get("height").toString()));
            if (updatedBio.containsKey("fitnessGoal")) member.setFitnessGoal(updatedBio.get("fitnessGoal").toString());
            if (updatedBio.containsKey("healthDetails")) member.setHealthDetails(updatedBio.get("healthDetails").toString());
            if (updatedBio.containsKey("dietType")) {
                try { member.setDietaryPreference(User.DietaryPreference.valueOf(updatedBio.get("dietType").toString())); } catch (Exception e) {}
            }
            if (updatedBio.containsKey("gender")) member.setGender(updatedBio.get("gender").toString());
            userRepository.save(member);
        }
        String dietMeals = "Standard Healthy Meals";
        String recommendation = "Maintain consistency with your nutrition.";
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://localhost:5000/predict/diet";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("gender", member.getGender());
            requestBody.put("age", member.getAge() != null ? member.getAge() : 25);
            requestBody.put("weight", member.getWeight() != null ? member.getWeight() : 70.0);
            requestBody.put("height", member.getHeight() != null ? member.getHeight() : 170.0);
            requestBody.put("fitnessGoal", member.getFitnessGoal());
            requestBody.put("dietType", member.getDietaryPreference() != null ? member.getDietaryPreference().name() : "NON_VEG");
            
            // Parse health details
            boolean hasHBP = member.getHealthDetails() != null && 
                            member.getHealthDetails().toLowerCase().contains("hypertension");
            boolean hasDiabetes = member.getHealthDetails() != null && 
                                member.getHealthDetails().toLowerCase().contains("diabetes");
            
            requestBody.put("highBloodPressure", hasHBP ? "Yes" : "No");
            requestBody.put("diabetes", hasDiabetes ? "Yes" : "No");

            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            if (response != null) {
                if (response.containsKey("dietPlan")) dietMeals = response.get("dietPlan").toString();
                if (response.containsKey("recommendation")) recommendation = response.get("recommendation").toString();
            }
        } catch (Exception e) {
            System.err.println("AI Diet Service Error: " + e.getMessage());
            dietMeals = "Fallback: High Protein Diet\nBreakfast: Eggs\nLunch: Chicken & Rice\nDinner: Fish & Veggies";
        }

        MealPlan aiPlan = new MealPlan();
        aiPlan.setMember(member);
        aiPlan.setTrainer(trainer);
        aiPlan.setPlanName("AI Personalized: " + member.getUsername());
        aiPlan.setIsAiGenerated(true);
        aiPlan.setMeals(dietMeals);
        aiPlan.setDietType("AI Optimized (" + (member.getDietaryPreference() != null ? member.getDietaryPreference() : "VARIES") + ")");
        aiPlan.setDailyCalories(2200.0); // Simplified
        aiPlan.setGoal(recommendation); // Store recommendation in Goal or separate field if available
        aiPlan.setIsActive(false);
        aiPlan.setIsReviewPending(true);

        return mealPlanRepository.save(aiPlan);
    }

    @org.springframework.transaction.annotation.Transactional
    public MealPlan confirmMealPlan(Long planId, MealPlan updatedData, String trainerUsername) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        if (!plan.getTrainer().getUsername().equals(trainerUsername)) {
            throw new RuntimeException("Unauthorized");
        }

        // Apply edits
        if (updatedData.getMeals() != null) plan.setMeals(updatedData.getMeals());
        if (updatedData.getGoal() != null) plan.setGoal(updatedData.getGoal());
        if (updatedData.getPlanName() != null) plan.setPlanName(updatedData.getPlanName());

        // Deactivate old plans for this member
        List<MealPlan> oldPlans = mealPlanRepository.findActivePlansByMemberId(plan.getMember().getId());
        for (MealPlan op : oldPlans) {
            op.setIsActive(false);
            mealPlanRepository.save(op);
        }

        plan.setIsActive(true);
        plan.setIsReviewPending(false);
        return mealPlanRepository.save(plan);
    }
}
