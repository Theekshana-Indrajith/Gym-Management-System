package com.musclehub.backend.repository;

import com.musclehub.backend.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByMemberId(Long memberId);
}
