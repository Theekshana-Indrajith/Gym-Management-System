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

    @Enumerated(EnumType.STRING)
    private Status status = Status.WORKING;

    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;

    public enum Status {
        WORKING, BROKEN, UNDER_MAINTENANCE
    }
}
