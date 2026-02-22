package com.musclehub.backend.controller;

import com.musclehub.backend.dto.MemberProfileDTO;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final UserRepository userRepository;

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

    @GetMapping("/workout-plan")
    public ResponseEntity<?> getLatestWorkout(Authentication authentication) {
        return ResponseEntity.ok(memberService.getLatestWorkoutAssignment(authentication.getName()).orElse(null));
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

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> cancelBooking(Authentication authentication, @PathVariable Long id) {
        System.out.println("Processing cancel request for session ID: " + id + " by user: " + authentication.getName());
        try {
            memberService.cancelBooking(authentication.getName(), id);
            System.out.println("Cancellation successful for ID: " + id);
            return ResponseEntity.ok("Appointment cancelled successfully");
        } catch (Exception e) {
            System.err.println("Error cancelling session ID: " + id);
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
