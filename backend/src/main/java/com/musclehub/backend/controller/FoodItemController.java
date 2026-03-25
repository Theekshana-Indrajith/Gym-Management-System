package com.musclehub.backend.controller;

import com.musclehub.backend.entity.FoodItem;
import com.musclehub.backend.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodItemController {
    private final FoodItemRepository foodItemRepository;

    @GetMapping
    public List<FoodItem> getAllFood() {
        return foodItemRepository.findAll();
    }

    @GetMapping("/category/{cat}")
    public List<FoodItem> getByCategory(@PathVariable String cat) {
        return foodItemRepository.findByCategory(cat);
    }
}
