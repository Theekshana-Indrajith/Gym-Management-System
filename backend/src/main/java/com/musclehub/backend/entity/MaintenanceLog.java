package com.musclehub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    private String issueType; // e.g., "Display Not Working", "Belt Tension", "Noise"
    private String urgency; // High, Medium, Low
    private String description;

    private String actionTaken;
    private String notes;
    private LocalDateTime logDate = LocalDateTime.now();
    private LocalDateTime resolveDate;
    private Double repairCost = 0.0;

    @Enumerated(EnumType.STRING)
    private LogStatus status = LogStatus.PENDING;

    public enum LogStatus {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
