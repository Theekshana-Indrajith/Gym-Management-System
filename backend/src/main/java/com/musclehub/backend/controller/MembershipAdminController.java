package com.musclehub.backend.controller;

import com.musclehub.backend.entity.MembershipPackage;
import com.musclehub.backend.entity.MembershipRequest;
import com.musclehub.backend.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/membership")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MembershipAdminController {

    private final MembershipService membershipService;

    @GetMapping("/packages")
    public ResponseEntity<List<MembershipPackage>> getAllPackages() {
        return ResponseEntity.ok(membershipService.getAllPackages());
    }

    @PostMapping("/packages")
    public ResponseEntity<MembershipPackage> createPackage(@RequestBody MembershipPackage pkg) {
        return ResponseEntity.ok(membershipService.createPackage(pkg));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<MembershipPackage> updatePackage(@PathVariable Long id, @RequestBody MembershipPackage pkg) {
        return ResponseEntity.ok(membershipService.updatePackage(id, pkg));
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        membershipService.deletePackage(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<MembershipRequest>> getPendingRequests() {
        return ResponseEntity.ok(membershipService.getPendingRequests());
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.processRequest(id, true));
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.processRequest(id, false));
    }

    @GetMapping("/members")
    public ResponseEntity<List<com.musclehub.backend.entity.User>> getAllMembers() {
        return ResponseEntity.ok(membershipService.getAllMembers());
    }

    @PostMapping("/members/{userId}/deactivate")
    public ResponseEntity<?> deactivateMembership(@PathVariable Long userId) {
        membershipService.deactivateMembership(userId);
        return ResponseEntity.ok().build();
    }
}
