package com.musclehub.backend.dto;

import com.musclehub.backend.entity.Inquiry;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class InquiryDTO {
    private Long id;
    private Long userId;
    private String username;
    private String senderName;
    private String senderEmail;
    private Long assignedToId;
    private String assignedToName;
    private String subject;
    private String message;
    private String reply;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;

    public InquiryDTO(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.senderName = inquiry.getSenderName();
        this.senderEmail = inquiry.getSenderEmail();
        if (inquiry.getUser() != null) {
            this.userId = inquiry.getUser().getId();
            this.username = inquiry.getUser().getUsername();
            if (this.senderName == null) this.senderName = inquiry.getUser().getUsername();
            if (this.senderEmail == null) this.senderEmail = inquiry.getUser().getEmail();
        }
        if (inquiry.getAssignedTo() != null) {
            this.assignedToId = inquiry.getAssignedTo().getId();
            this.assignedToName = inquiry.getAssignedTo().getUsername();
        }
        this.subject = inquiry.getSubject();
        this.message = inquiry.getMessage();
        this.reply = inquiry.getReply();
        this.status = inquiry.getStatus().name();
        this.createdAt = inquiry.getCreatedAt();
        this.repliedAt = inquiry.getRepliedAt();
    }
}
