package com.musclehub.backend.controller;

import com.musclehub.backend.dto.RegisterRequest;
import com.musclehub.backend.entity.*;
import com.musclehub.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/admins")
    public ResponseEntity<?> getAdmins() {
        return ResponseEntity.ok(adminService.getAllUsersByRole(User.Role.ADMIN));
    }

    @GetMapping("/trainers")
    public ResponseEntity<?> getTrainers() {
        return ResponseEntity.ok(adminService.getAllUsersByRole(User.Role.TRAINER));
    }

    @GetMapping("/members")
    public ResponseEntity<?> getMembers() {
        return ResponseEntity.ok(adminService.getAllUsersByRole(User.Role.MEMBER));
    }

    @PostMapping("/add-user")
    public ResponseEntity<?> addUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(adminService.addUser(request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }

    @PostMapping("/assign-trainer")
    public ResponseEntity<?> assignTrainer(@RequestBody Map<String, Long> payload) {
        adminService.assignTrainerToMember(payload.get("memberId"), payload.get("trainerId"));
        return ResponseEntity.ok("Trainer assigned");
    }

    @GetMapping("/equipment")
    public ResponseEntity<?> getEquipment() {
        return ResponseEntity.ok(adminService.getAllEquipment());
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(adminService.addEquipment(equipment));
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<?> updateEquipment(@PathVariable Long id, @RequestBody Equipment updated) {
        return ResponseEntity.ok(adminService.updateEquipment(id, updated));
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id) {
        adminService.deleteEquipment(id);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/supplements")
    public ResponseEntity<?> getSupplements() {
        return ResponseEntity.ok(adminService.getAllSupplements());
    }

    @PostMapping("/supplements")
    public ResponseEntity<?> addSupplement(@RequestBody Supplement supplement) {
        return ResponseEntity.ok(adminService.addSupplement(supplement));
    }

    @GetMapping("/supplements/orders")
    public ResponseEntity<?> getSupplementOrders() {
        return ResponseEntity.ok(adminService.getAllSupplementOrders());
    }

    @GetMapping("/inquiries")
    public ResponseEntity<?> getInquiries() {
        return ResponseEntity.ok(adminService.getAllInquiries());
    }

    @PostMapping("/inquiries/{id}/reply")
    public ResponseEntity<?> replyInquiry(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        adminService.replyToInquiry(id, payload.get("reply"));
        return ResponseEntity.ok("Reply sent");
    }
}
