package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "trainer_slots")
public class TrainerSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer bookedCount = 0;

    private String status; // "AVAILABLE", "FULL"

    @OneToMany(mappedBy = "slot")
    private java.util.List<TrainerSession> sessions = new java.util.ArrayList<>();
}
