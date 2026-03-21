package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "food_items")
public class FoodItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double caloriesPer100g;
    private String category; // VEG, NON_VEG, VEGAN
    private String foodType; // MEAT, VEGGIE, GRAIN, FRUIT
    private String subType; // BEEF, PORK, CHICKEN, etc. if meat
}
