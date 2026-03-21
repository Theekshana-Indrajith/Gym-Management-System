package com.musclehub.backend.controller;

import com.musclehub.backend.dto.MemberProfileDTO;
import com.musclehub.backend.entity.MealPlan;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutPlan;
import com.musclehub.backend.repository.MealPlanRepository;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.WorkoutPlanRepository;
import com.musclehub.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final UserRepository userRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final MealPlanRepository mealPlanRepository;

    @GetMapping("/profile")
    public ResponseEntity<MemberProfileDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(memberService.getProfileDTO(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<MemberProfileDTO> updateProfile(Authentication authentication,
            @RequestBody User profileData) {
        User updatedUser = memberService.updateProfile(authentication.getName(), profileData);
        return ResponseEntity.ok(memberService.getProfileDTO(updatedUser.getUsername()));
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress(Authentication authentication) {
        return ResponseEntity.ok(memberService.getProgressLogs(authentication.getName()));
    }

    @GetMapping("/latest-workout")
    public ResponseEntity<?> getLatestWorkout(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();
        List<WorkoutPlan> plans = workoutPlanRepository.findByMemberIdWithDetails(user.getId());
        return ResponseEntity.ok(plans.isEmpty() ? null : plans.get(plans.size() - 1));
    }

    @GetMapping("/latest-meal")
    public ResponseEntity<?> getLatestMeal(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();
        List<MealPlan> plans = mealPlanRepository.findByMemberIdWithDetails(user.getId());
        return ResponseEntity.ok(plans.isEmpty() ? null : plans.get(plans.size() - 1));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(Authentication authentication) {
        return ResponseEntity.ok(memberService.getMySessions(authentication.getName()));
    }

    @GetMapping("/trainers")
    public ResponseEntity<?> getAllTrainers() {
        return ResponseEntity.ok(memberService.getAllTrainers());
    }

    @GetMapping("/trainers/{id}/slots")
    public ResponseEntity<?> getTrainerSlots(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getTrainerSlots(id));
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<?> bookSlot(Authentication authentication, @PathVariable Long slotId) {
        try {
            memberService.bookSlot(authentication.getName(), slotId);
            return ResponseEntity.ok("Booking successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/bookings/{sessionId}")
    public ResponseEntity<?> cancelBooking(Authentication authentication, @PathVariable Long sessionId) {
        try {
            memberService.cancelBooking(authentication.getName(), sessionId);
            return ResponseEntity.ok("Booking cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/inquiries")
    public ResponseEntity<?> submitInquiry(Authentication authentication, @RequestBody java.util.Map<String, String> payload) {
        try {
            memberService.submitInquiry(
                authentication.getName(),
                payload.get("subject"),
                payload.get("message")
            );
            return ResponseEntity.ok("Inquiry submitted successfully");
        } catch (Exception e) {
            e.printStackTrace(); // Log the error to console/log file
            return ResponseEntity.status(500).body("Backend Error: " + e.getMessage());
        }
    }

    @GetMapping("/inquiries")
    public ResponseEntity<?> getMyInquiries(Authentication authentication) {
        return ResponseEntity.ok(memberService.getMyInquiries(authentication.getName()));
    }

    @GetMapping("/equipment-status")
    public ResponseEntity<?> getEquipmentStatus() {
        return ResponseEntity.ok(memberService.getAllEquipmentStatus());
    }
}
