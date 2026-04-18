package com.musclehub.backend.repository;

import com.musclehub.backend.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    @Query("SELECT m FROM MealPlan m LEFT JOIN FETCH m.member LEFT JOIN FETCH m.trainer LEFT JOIN FETCH m.recommendedSupplement")
    List<MealPlan> findAllWithDetails();

    @Query("SELECT m FROM MealPlan m LEFT JOIN FETCH m.member LEFT JOIN FETCH m.trainer WHERE m.member.id = :memberId")
    List<MealPlan> findByMemberIdWithDetails(Long memberId);

    @Query("SELECT m FROM MealPlan m WHERE m.member.id = :memberId AND m.isActive = true")
    List<MealPlan> findActivePlansByMemberId(Long memberId);

    @Query("SELECT m FROM MealPlan m LEFT JOIN FETCH m.member LEFT JOIN FETCH m.trainer WHERE m.member.id = :memberId AND m.isActive = true AND m.isReviewPending = false")
    List<MealPlan> findPublishedPlansByMemberId(Long memberId);

    @Query("SELECT m FROM MealPlan m LEFT JOIN FETCH m.member LEFT JOIN FETCH m.trainer LEFT JOIN FETCH m.recommendedSupplement WHERE m.trainer.id = :trainerId")
    List<MealPlan> findByTrainerIdWithDetails(Long trainerId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM MealPlan m WHERE m.member.id = :id")
    void deleteByMemberId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM MealPlan m WHERE m.trainer.id = :id")
    void deleteByTrainerId(Long id);
}
