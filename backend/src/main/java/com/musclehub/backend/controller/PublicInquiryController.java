package com.musclehub.backend.controller;

import com.musclehub.backend.entity.Inquiry;
import com.musclehub.backend.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicInquiryController {

    private final InquiryRepository inquiryRepository;
    private final com.musclehub.backend.service.NotificationService notificationService;

    @PostMapping("/inquiry")
    public ResponseEntity<?> submitInquiry(@RequestBody Map<String, String> payload) {
        Inquiry inquiry = new Inquiry();
        inquiry.setSenderName(payload.get("name"));
        inquiry.setSenderEmail(payload.get("email"));
        inquiry.setSubject(payload.get("subject") != null ? payload.get("subject") : "Public Inquiry");
        inquiry.setMessage(payload.get("message"));
        inquiry.setStatus(Inquiry.Status.OPEN);
        
        inquiryRepository.save(inquiry);

        // Notify Admins
        notificationService.createAdminNotification(
            "New Inquiry Received 📩",
            "A new inquiry from " + inquiry.getSenderName() + " has been received: " + inquiry.getSubject(),
            "INQUIRY"
        );

        return ResponseEntity.ok("Inquiry received");
    }
}
