package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
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
    @ToString.Exclude
    private User trainer;

    @ManyToOne
    @JoinColumn(name = "member_id")
    @ToString.Exclude
    private User member;

    @ManyToOne(optional = true)
    @JoinColumn(name = "slot_id")
    @ToString.Exclude
    private TrainerSlot slot;

    private String sessionType;
    private String venue;
    private String status; // UPCOMING, COMPLETED, CANCELLED
    private LocalDateTime sessionTime;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
