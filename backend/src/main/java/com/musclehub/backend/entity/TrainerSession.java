package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "trainer_sessions")
public class TrainerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private User member;

    @ManyToOne(optional = true)
    @JoinColumn(name = "slot_id")
    private TrainerSlot slot;

    private String sessionType;
    private String venue;
    private String status; // UPCOMING, COMPLETED, CANCELLED
    private LocalDateTime sessionTime;
    private LocalDateTime endTime;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
