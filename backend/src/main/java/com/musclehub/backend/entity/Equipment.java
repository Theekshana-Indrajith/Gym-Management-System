package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String serialNumber;
    private String location; // e.g., "Zone A", "Cardio Area"
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private Double cost;

    @Enumerated(EnumType.STRING)
    private Status status = Status.WORKING;

    @Enumerated(EnumType.STRING)
    private ConditionLevel equipmentCondition = ConditionLevel.EXCELLENT;

    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;

    // Alternative Equipment Recommendation (Setup by Admin)
    private Long alternativeId;
    private String alternativeName;

    public enum Status {
        WORKING, BROKEN, UNDER_MAINTENANCE, DEACTIVATED, RETIRED
    }

    public enum ConditionLevel {
        EXCELLENT, GOOD, FAIR, POOR, CRITICAL
    }
}
