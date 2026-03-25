package com.musclehub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_read")
    private boolean read = false;

    // Optional: target user if it's a private notification
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Optional: category to filter notifications
    private String type; // e.g., "SUPPLEMENT", "SYSTEM", "SESSION"
}
