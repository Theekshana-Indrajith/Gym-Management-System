package com.musclehub.backend.controller;

import com.musclehub.backend.dto.UserDTO;
import com.musclehub.backend.service.TrainerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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

    @PostMapping("/equipment/log-repair")
    public ResponseEntity<?> logRepair(Authentication authentication, @RequestBody Map<String, Object> payload) {
        trainerService.logRepairAction(
                Long.valueOf(payload.get("equipmentId").toString()),
                authentication.getName(),
                payload.get("action").toString(),
                payload.get("notes").toString(),
                Double.valueOf(payload.get("cost").toString()));
        return ResponseEntity.ok("Repair logged successfully");
    }

    @PostMapping("/equipment/{id}/report-issue")
    public ResponseEntity<?> reportIssue(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            trainerService.reportEquipmentIssue(
                id,
                authentication.getName(),
                payload.get("issueType"),
                payload.get("urgency"),
                payload.get("description") != null ? payload.get("description") : "");
            return ResponseEntity.ok("Issue reported successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Report failed: " + e.getMessage());
        }
    }

    @PostMapping("/assign-workout")
    public ResponseEntity<?> assignWorkout(Authentication authentication, @RequestBody Map<String, Object> payload) {
        trainerService.assignWorkout(
                authentication.getName(),
                Long.valueOf(payload.get("memberId").toString()),
                payload.get("workout").toString(),
                payload.get("diet").toString());
        return ResponseEntity.ok("Workout assigned successfully");
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

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<?> completeSession(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        trainerService.completeSession(id, payload.get("status"), payload.get("notes"));
        return ResponseEntity.ok("Session status updated");
    }

    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(Authentication authentication, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(trainerService.createSlot(
                authentication.getName(),
                java.time.LocalDateTime.parse(payload.get("start").toString()),
                java.time.LocalDateTime.parse(payload.get("end").toString()),
                Integer.valueOf(payload.get("capacity").toString())));
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(trainerService.updateSlot(
                id,
                payload.get("capacity") != null ? Integer.valueOf(payload.get("capacity").toString()) : null,
                payload.get("start") != null ? java.time.LocalDateTime.parse(payload.get("start").toString()) : null,
                payload.get("end") != null ? java.time.LocalDateTime.parse(payload.get("end").toString()) : null));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        trainerService.deleteSlot(id);
        return ResponseEntity.ok("Slot deleted successfully");
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getMySlots(authentication.getName()));
    }

    // Changing path and method to POST to avoid conflict with static resource
    // handling and PUT issues
    @PostMapping("/update-member-fitness")
    public ResponseEntity<?> updateMemberFitness(@RequestBody Map<String, Object> payload) {
        try {
            Long memberId = Long.valueOf(payload.get("memberId").toString());
            UserDTO fitnessData = new UserDTO();

            if (payload.get("age") != null)
                fitnessData.setAge(Double.valueOf(payload.get("age").toString()).intValue());
            if (payload.get("height") != null)
                fitnessData.setHeight(Double.valueOf(payload.get("height").toString()));
            if (payload.get("weight") != null)
                fitnessData.setWeight(Double.valueOf(payload.get("weight").toString()));
            if (payload.get("gender") != null)
                fitnessData.setGender(payload.get("gender").toString());
            if (payload.get("phoneNumber") != null)
                fitnessData.setPhoneNumber(payload.get("phoneNumber").toString());
            if (payload.get("fitnessGoal") != null)
                fitnessData.setFitnessGoal(payload.get("fitnessGoal").toString());
            if (payload.get("allergies") != null)
                fitnessData.setAllergies(payload.get("allergies").toString());
            if (payload.get("chest") != null)
                fitnessData.setChest(Double.valueOf(payload.get("chest").toString()));
            if (payload.get("waist") != null)
                fitnessData.setWaist(Double.valueOf(payload.get("waist").toString()));
            if (payload.get("biceps") != null)
                fitnessData.setBiceps(Double.valueOf(payload.get("biceps").toString()));
            if (payload.get("thighs") != null)
                fitnessData.setThighs(Double.valueOf(payload.get("thighs").toString()));
            if (payload.get("healthDetails") != null)
                fitnessData.setHealthDetails(payload.get("healthDetails").toString());

            trainerService.updateMemberFitnessData(memberId, fitnessData);
            return ResponseEntity.ok("Member fitness profile synchronized successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/member/{id}/progress")
    public ResponseEntity<?> getMemberProgress(@PathVariable Long id) {
        return ResponseEntity.ok(trainerService.getMemberProgress(id));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return ResponseEntity.ok(trainerService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UserDTO profileData) {
        trainerService.updateProfile(authentication.getName(), profileData);
        return ResponseEntity.ok("Profile updated successfully");
    }
}
