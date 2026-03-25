package com.musclehub.backend.util;

import com.musclehub.backend.entity.FoodItem;
import com.musclehub.backend.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final FoodItemRepository foodItemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (foodItemRepository.count() == 0) {
            FoodItem rice = new FoodItem();
            rice.setName("Cooked White Rice");
            rice.setCaloriesPer100g(130.0);
            rice.setCategory("VEGAN");
            rice.setFoodType("GRAIN");

            FoodItem chicken = new FoodItem();
            chicken.setName("Grilled Chicken Breast");
            chicken.setCaloriesPer100g(165.0);
            chicken.setCategory("NON_VEG");
            chicken.setFoodType("MEAT");
            chicken.setSubType("CHICKEN");

            FoodItem beef = new FoodItem();
            beef.setName("Roasted Beef Steaks");
            beef.setCaloriesPer100g(250.0);
            beef.setCategory("NON_VEG");
            beef.setFoodType("MEAT");
            beef.setSubType("BEEF");

            FoodItem paneer = new FoodItem();
            paneer.setName("Paneer Tikka");
            paneer.setCaloriesPer100g(265.0);
            paneer.setCategory("VEGETARIAN");
            paneer.setFoodType("DAIRY");

            FoodItem oats = new FoodItem();
            oats.setName("Rolled Oats");
            oats.setCaloriesPer100g(380.0);
            oats.setCategory("VEGAN");
            oats.setFoodType("GRAIN");

            FoodItem pork = new FoodItem();
            pork.setName("Pork Chop Roast");
            pork.setCaloriesPer100g(240.0);
            pork.setCategory("NON_VEG");
            pork.setFoodType("MEAT");
            pork.setSubType("PORK");

            foodItemRepository.saveAll(Arrays.asList(rice, chicken, beef, paneer, oats, pork));
        }
    }
}
