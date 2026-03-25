package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inquiries")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo; // Can be a trainer or admin

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String reply;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime repliedAt;

    public enum Status {
        OPEN, CLOSED, PENDING
    }
}
