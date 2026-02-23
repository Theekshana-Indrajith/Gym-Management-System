package com.musclehub.backend.controller;

import com.musclehub.backend.service.TrainerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService trainerService;

    @GetMapping("/my-members")
    public ResponseEntity<?> getMyMembers(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getMyMembers(authentication.getName()));
    }

    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> payload) {
        trainerService.markAttendance(
                Long.valueOf(payload.get("memberId").toString()),
                payload.get("status").toString());
        return ResponseEntity.ok("Attendance marked successfully");
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<?> updateEquipment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        trainerService.updateEquipmentStatus(id, payload.get("status"));
        return ResponseEntity.ok("Equipment status updated");
    }

    @PostMapping("/workout-plan")
    public ResponseEntity<?> assignWorkoutPlan(Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        trainerService.assignWorkoutPlan(
                authentication.getName(),
                Long.valueOf(payload.get("memberId").toString()),
                payload.get("planName").toString(),
                payload.get("exercises").toString(),
                payload.get("difficulty").toString(),
                payload.get("goal").toString());
        return ResponseEntity.ok("Workout plan assigned successfully");
    }

    @PostMapping("/meal-plan")
    public ResponseEntity<?> assignMealPlan(Authentication authentication, @RequestBody Map<String, Object> payload) {
        trainerService.assignMealPlan(
                authentication.getName(),
                Long.valueOf(payload.get("memberId").toString()),
                payload.get("planName").toString(),
                payload.get("breakfast").toString(),
                payload.get("lunch").toString(),
                payload.get("dinner").toString(),
                payload.get("snacks").toString(),
                Double.valueOf(payload.get("dailyCalories").toString()),
                payload.get("dietType").toString(),
                payload.get("recommendedSupplements").toString());
        return ResponseEntity.ok("Meal plan assigned successfully");
    }

    @GetMapping("/inquiries")
    public ResponseEntity<?> getInquiries(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getMyInquiries(authentication.getName()));
    }

    @PostMapping("/inquiries/{id}/reply")
    public ResponseEntity<?> replyToInquiry(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Authentication authentication) {
        trainerService.replyToInquiry(id, payload.get("reply"), authentication.getName());
        return ResponseEntity.ok("Reply sent");
    }

    @GetMapping("/equipment")
    public ResponseEntity<?> getAllEquipment() {
        return ResponseEntity.ok(trainerService.getAllEquipment());
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getMySessions(authentication.getName()));
    }

    @PostMapping("/sessions")
    public ResponseEntity<?> addSession(Authentication authentication, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(trainerService.addSession(
                authentication.getName(),
                Long.valueOf(payload.get("memberId").toString()),
                payload.get("type").toString(),
                payload.get("venue").toString(),
                java.time.LocalDateTime.parse(payload.get("time").toString())));
    }

    @PutMapping("/sessions/{id}/complete")
    public ResponseEntity<?> completeSession(@PathVariable Long id) {
        trainerService.completeSession(id);
        return ResponseEntity.ok("Session completed");
    }

    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(Authentication authentication, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(trainerService.createSlot(
                authentication.getName(),
                java.time.LocalDateTime.parse(payload.get("start").toString()),
                java.time.LocalDateTime.parse(payload.get("end").toString()),
                Integer.valueOf(payload.get("capacity").toString())));
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getMySlots(authentication.getName()));
    }
}
