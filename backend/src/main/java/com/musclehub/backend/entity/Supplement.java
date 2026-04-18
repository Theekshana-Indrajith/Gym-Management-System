package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "supplements")
public class Supplement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String category;
    private Double price;
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String servingSize;
    private String dailyFrequency;
    private String suggestedUse;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;
}
