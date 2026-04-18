package com.musclehub.backend.service;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutPlan;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;
    private final com.musclehub.backend.repository.WorkoutLogRepository workoutLogRepository;
    private final com.musclehub.backend.repository.EquipmentRepository equipmentRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPlans() {
        return workoutPlanRepository.findAllWithDetails().stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMemberPlansWithReview(Long memberId, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<WorkoutPlan> allPlans = workoutPlanRepository.findByMemberIdWithDetails(memberId);
        
        // If requester is the member, hide plans in review. 
        // If trainer/admin, show everything.
        if (requester.getRole() == User.Role.MEMBER && requester.getId().equals(memberId)) {
            return allPlans.stream()
                    .filter(p -> p.getStatus() != WorkoutPlan.PlanStatus.REVIEW_PENDING)
                    .map(this::mapToMap)
                    .collect(Collectors.toList());
        }
        
        return allPlans.stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTrainerPlans(Long trainerId) {
        return workoutPlanRepository.findByTrainerIdWithDetails(trainerId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> mapToMap(WorkoutPlan plan) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", plan.getId());
        map.put("planName", plan.getPlanName());
        map.put("exercises", plan.getExercises());
        map.put("difficulty", plan.getDifficulty());
        map.put("goal", plan.getGoal());
        map.put("isAiGenerated", plan.getIsAiGenerated());
        map.put("status", plan.getStatus() != null ? plan.getStatus().name() : "CURRENT");
        map.put("planType", plan.getPlanType() != null ? plan.getPlanType() : "MANUAL");
        map.put("createdDate", plan.getCreatedDate() != null ? plan.getCreatedDate().toString() : null);

        if (plan.getMember() != null) {
            map.put("memberId", plan.getMember().getId());
            map.put("memberUsername", plan.getMember().getUsername());
        } else {
            // Safety for existing data that might have null links
            map.put("memberId", null);
            map.put("memberUsername", "N/A");
        }

        if (plan.getTrainer() != null) {
            map.put("trainerId", plan.getTrainer().getId());
            map.put("trainerUsername", plan.getTrainer().getUsername());
        }
        return map;
    }

    @Transactional
    public WorkoutPlan createOrAssignPlan(WorkoutPlan plan, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can manage workout plans");
        }

        User member = userRepository.findById(plan.getMember().getId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Archive ALL existing active plans for this member to maintain exclusivity
        List<WorkoutPlan> oldPlans = workoutPlanRepository.findCurrentPlansByMemberId(member.getId());
        
        for (WorkoutPlan cp : oldPlans) {
            cp.setStatus(WorkoutPlan.PlanStatus.ARCHIVED);
            workoutPlanRepository.save(cp);
        }

        plan.setTrainer(trainer);
        plan.setMember(member);
        plan.setStatus(WorkoutPlan.PlanStatus.CURRENT);
        plan.setCreatedDate(java.time.LocalDate.now());
        return workoutPlanRepository.save(plan);
    }

    @Transactional
    public void deactivatePlan(Long id, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can manage workout plans");
        }

        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));
        
        plan.setStatus(WorkoutPlan.PlanStatus.ARCHIVED);
        workoutPlanRepository.save(plan);
    }

    public void deletePlan(Long id, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER && trainer.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only trainers can delete workout plans");
        }

        // Handle WorkoutLogs - find by plan id and delete
        List<com.musclehub.backend.entity.WorkoutLog> relatedLogs = workoutLogRepository.findAll().stream()
                .filter(log -> log.getWorkoutPlan() != null && log.getWorkoutPlan().getId().equals(id))
                .collect(Collectors.toList());
        workoutLogRepository.deleteAll(relatedLogs);

        workoutPlanRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public WorkoutPlan triggerAiGeneration(Long memberId, Map<String, Object> updatedBio, String trainerUsername) {
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
            if (updatedBio.containsKey("gender")) member.setGender(updatedBio.get("gender").toString());
            userRepository.save(member);
        }

        // Call Flask AI Service
        String workoutExercises = "General Fitness Routine";
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://localhost:5000/predict/exercise";
            
            Map<String, Object> request = new HashMap<>();
            request.put("gender", member.getGender());
            request.put("age", member.getAge() != null ? member.getAge() : 25);
            request.put("weight", member.getWeight() != null ? member.getWeight() : 70.0);
            request.put("height", member.getHeight() != null ? member.getHeight() : 170.0);
            request.put("fitnessGoal", member.getFitnessGoal());
            
            // Parse health details for HBP
            boolean hasHBP = member.getHealthDetails() != null && 
                            member.getHealthDetails().toLowerCase().contains("hypertension");
            request.put("highBloodPressure", hasHBP ? "Yes" : "No");

            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            if (response != null && response.containsKey("workoutPlan")) {
                workoutExercises = response.get("workoutPlan").toString();
                // Convert AI plain-text exercises to structured JSON (enables BROKEN badge + alternate UI)
                workoutExercises = buildStructuredExercisesJson(workoutExercises);
            }
        } catch (Exception e) {
            System.err.println("AI Service Error: " + e.getMessage());
            workoutExercises = "Neural Analysis Fallback:\n1. Cardio 20min\n2. Bodyweight Squats 3x12\n3. Pushups 3x10";
        }

        WorkoutPlan aiPlan = new WorkoutPlan();
        aiPlan.setMember(member);
        aiPlan.setTrainer(trainer);
        aiPlan.setPlanName("AI Generated: " + member.getUsername());
        aiPlan.setIsAiGenerated(true);
        aiPlan.setExercises(workoutExercises);
        aiPlan.setGoal(member.getFitnessGoal() != null ? member.getFitnessGoal() : "AI Optimized");
        aiPlan.setDifficulty("ADAPTIVE");
        aiPlan.setStatus(WorkoutPlan.PlanStatus.REVIEW_PENDING);
        aiPlan.setCreatedDate(java.time.LocalDate.now());

        return workoutPlanRepository.save(aiPlan);
    }

    /**
     * Converts AI plain-text exercise string into the same structured JSON format
     * that manual plans use. This lets the existing frontend parseExercises() logic
     * automatically show the BROKEN badge + STRATEGIC ALTERNATE box for AI plans.
     *
     * AI format:  "Leg press 10 3; Barbell bench press 8 3; Treadmill walking 15min 1"
     * Output JSON: [{name, equipmentId, equipmentName, setsReps}, ...]
     */
    private String buildStructuredExercisesJson(String aiExerciseStr) {
        if (aiExerciseStr == null || aiExerciseStr.isBlank()) return aiExerciseStr;

        // Fetch all gym equipment once for matching
        java.util.List<com.musclehub.backend.entity.Equipment> allEquipment = equipmentRepository.findAll();

        java.util.List<java.util.Map<String, Object>> structuredList = new java.util.ArrayList<>();

        // AI output is separated by ";"
        for (String part : aiExerciseStr.split(";")) {
            part = part.trim();
            if (part.isEmpty()) continue;

            // Split into tokens to extract exercise name and sets/reps
            // Rule: last 2 tokens = sets & reps, everything before = exercise name
            String[] tokens = part.split("\\s+");
            String exerciseName;
            String setsReps;

            if (tokens.length >= 3) {
                setsReps = tokens[tokens.length - 2] + " x " + tokens[tokens.length - 1];
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < tokens.length - 2; i++) {
                    if (i > 0) sb.append(" ");
                    sb.append(tokens[i]);
                }
                exerciseName = sb.toString();
            } else if (tokens.length == 2) {
                exerciseName = tokens[0];
                setsReps = tokens[1];
            } else {
                exerciseName = part;
                setsReps = "";
            }

            // Match exercise name to gym equipment using two-tier scoring:
            // Tier 1: exact substring match (high priority)
            // Tier 2: word-level overlap (handles "Treadmill walking" ↔ "Treadmill T8000")
            com.musclehub.backend.entity.Equipment matched = null;
            int bestScore = 0;
            for (com.musclehub.backend.entity.Equipment eq : allEquipment) {
                if (eq.getName() == null) continue;
                int score = equipmentMatchScore(exerciseName, eq.getName());
                if (score > bestScore) {
                    bestScore = score;
                    matched = eq;
                }
            }

            java.util.Map<String, Object> exMap = new java.util.LinkedHashMap<>();
            exMap.put("name", exerciseName);
            exMap.put("setsReps", setsReps);
            if (matched != null) {
                exMap.put("equipmentId", matched.getId());
                exMap.put("equipmentName", matched.getName());
            } else {
                exMap.put("equipmentId", null);
                exMap.put("equipmentName", "No Equipment");
            }
            structuredList.add(exMap);
        }

        // Serialize to JSON string (same format manual plans produce)
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(structuredList);
        } catch (Exception e) {
            System.err.println("JSON serialization failed, using raw AI string: " + e.getMessage());
            return aiExerciseStr; // safe fallback
        }
    }

    /**
     * Scores how well an exercise name matches an equipment name.
     *
     * Tier 1 (score 1000+): one string fully contains the other  — exact match.
     * Tier 2 (score 1–999): shared significant words (length >= 4 chars).
     *   Each shared word adds its length to the score so longer/rarer words
     *   carry more weight. "Treadmill" (9) outweighs "Press" (5).
     *
     * Examples:
     *   "Treadmill walking" vs "Treadmill T8000"  → score 9  (word "treadmill")
     *   "Leg press"         vs "Leg Press Machine" → score 1005 (exact contains)
     *   "Push ups"          vs "Treadmill T8000"   → score 0  (no overlap)
     */
    private int equipmentMatchScore(String exerciseName, String equipmentName) {
        String exLower = exerciseName.toLowerCase();
        String eqLower = equipmentName.toLowerCase();

        // Tier 1: exact substring match
        if (exLower.contains(eqLower) || eqLower.contains(exLower)) {
            return 1000 + equipmentName.length();
        }

        // Tier 2: word-level overlap
        int score = 0;
        for (String word : eqLower.split("\\s+")) {
            if (word.length() >= 4 && exLower.contains(word)) {
                score += word.length();
            }
        }
        for (String word : exLower.split("\\s+")) {
            if (word.length() >= 4 && eqLower.contains(word)) {
                score += word.length();
            }
        }
        return score;
    }

    @org.springframework.transaction.annotation.Transactional
    public WorkoutPlan confirmAiPlan(Long planId, WorkoutPlan updatedData, String trainerUsername) {
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        if (!plan.getTrainer().getUsername().equals(trainerUsername)) {
            throw new RuntimeException("Unauthorized");
        }

        // Apply trainer edits
        if (updatedData.getExercises() != null) plan.setExercises(updatedData.getExercises());
        if (updatedData.getPlanName() != null) plan.setPlanName(updatedData.getPlanName());

        // Now archive old plans
        List<WorkoutPlan> oldPlans = workoutPlanRepository.findCurrentPlansByMemberId(plan.getMember().getId());
        for (WorkoutPlan cp : oldPlans) {
            cp.setStatus(WorkoutPlan.PlanStatus.ARCHIVED);
            workoutPlanRepository.save(cp);
        }

        // Set this one to current
        plan.setStatus(WorkoutPlan.PlanStatus.CURRENT);
        return workoutPlanRepository.save(plan);
    }

    @Transactional
    public void logWorkoutActivity(String username, Long planId, String exercisesJson, Double percentage, java.time.LocalDate logDate) {
        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        com.musclehub.backend.entity.WorkoutLog log = new com.musclehub.backend.entity.WorkoutLog();
        log.setMember(member);
        log.setWorkoutPlan(plan);
        log.setCompletedExercises(exercisesJson);
        log.setCompletionPercentage(percentage);
        log.setDate(logDate != null ? logDate : java.time.LocalDate.now());
        workoutLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getWeeklyPerformanceSummary(String username, Long planId) {
        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        java.time.LocalDate end = java.time.LocalDate.now();
        java.time.LocalDate start = end.minusDays(7);
        
        List<com.musclehub.backend.entity.WorkoutLog> allLogs = workoutLogRepository.findByMemberAndDateBetweenOrderByDateDesc(member, start, end);
        
        // Filter by plan if specified
        List<com.musclehub.backend.entity.WorkoutLog> logs = allLogs.stream()
                .filter(log -> planId == null || (log.getWorkoutPlan() != null && log.getWorkoutPlan().getId().equals(planId)))
                .collect(Collectors.toList());
        
        double avgCompletion = logs.stream()
                .mapToDouble(log -> log.getCompletionPercentage() != null ? log.getCompletionPercentage() : 0.0)
                .average()
                .orElse(0.0);

        // Consistency is logs in last 7 days vs potential 7 days (simplified)
        double consistency = (logs.size() / 7.0) * 100;

        List<Map<String, Object>> logMaps = logs.stream().map(log -> {
            Map<String, Object> l = new HashMap<>();
            l.put("id", log.getId());
            l.put("date", log.getDate().toString());
            l.put("completedExercises", log.getCompletedExercises());
            l.put("completionPercentage", log.getCompletionPercentage());
            if (log.getWorkoutPlan() != null) {
                l.put("planName", log.getWorkoutPlan().getPlanName());
            }
            return l;
        }).collect(Collectors.toList());

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLogs", logs.size());
        summary.put("averageCompletion", avgCompletion);
        summary.put("consistencyPercentage", Math.min(consistency, 100.0));
        summary.put("logs", logMaps);
        return summary;
    }
}
