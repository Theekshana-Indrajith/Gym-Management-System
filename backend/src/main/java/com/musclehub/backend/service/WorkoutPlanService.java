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
    public List<Map<String, Object>> getMemberPlans(Long memberId) {
        return workoutPlanRepository.findByMemberIdWithDetails(memberId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTrainerPlans(Long trainerId) {
        return workoutPlanRepository.findByTrainerIdWithDetails(trainerId).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapToMap(WorkoutPlan plan) {
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

    public WorkoutPlan triggerAiGeneration(Long memberId, String trainerUsername) {
        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER) {
            throw new RuntimeException("Only trainers can trigger AI generation");
        }

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Archive ALL existing active plans for this member to maintain exclusivity
        List<WorkoutPlan> oldPlans = workoutPlanRepository.findCurrentPlansByMemberId(member.getId());
        for (WorkoutPlan cp : oldPlans) {
            cp.setStatus(WorkoutPlan.PlanStatus.ARCHIVED);
            workoutPlanRepository.save(cp);
        }

        // Placeholder for AI Logic
        WorkoutPlan aiPlan = new WorkoutPlan();
        aiPlan.setMember(member);
        aiPlan.setTrainer(trainer);
        aiPlan.setPlanName("AI Generated: " + member.getUsername());
        aiPlan.setIsAiGenerated(true);
        aiPlan.setExercises("Neural Analysis Pending...\n1. Daily Cardio\n2. Strength Training");
        aiPlan.setGoal("AI Optimized");
        aiPlan.setDifficulty("ADAPTIVE");
        aiPlan.setStatus(WorkoutPlan.PlanStatus.CURRENT);
        aiPlan.setCreatedDate(java.time.LocalDate.now());

        return workoutPlanRepository.save(aiPlan);
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
