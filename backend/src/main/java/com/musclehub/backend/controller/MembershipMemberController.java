package com.musclehub.backend.controller;

import com.musclehub.backend.entity.MembershipPackage;
import com.musclehub.backend.entity.MembershipRequest;
import com.musclehub.backend.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
public class MembershipMemberController {

    private final MembershipService membershipService;

    @GetMapping("/packages")
    public ResponseEntity<List<MembershipPackage>> getActivePackages() {
        return ResponseEntity.ok(membershipService.getActivePackages());
    }

    @GetMapping("/public/packages")
    public ResponseEntity<List<MembershipPackage>> getPublicPackages() {
        return ResponseEntity.ok(membershipService.getActivePackages());
    }

    @PostMapping(value = "/subscribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MembershipRequest> subscribe(
            Authentication authentication,
            @RequestParam Long packageId,
            @RequestParam(required = false) String paymentRef,
            @RequestParam("slip") MultipartFile slip) {
        return ResponseEntity
                .ok(membershipService.createRequest(authentication.getName(), packageId, paymentRef, slip));
    }

    @GetMapping("/slips/{filename}")
    public ResponseEntity<Resource> getSlip(@PathVariable String filename) {
        try {
            Path path = Paths.get("uploads/slips").resolve(filename);
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelMembership(Authentication authentication) {
        membershipService.cancelMembership(authentication.getName());
        return ResponseEntity.ok("Membership cancelled successfully");
    }
}
