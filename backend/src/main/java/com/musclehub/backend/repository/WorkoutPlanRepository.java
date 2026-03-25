package com.musclehub.backend.repository;

import com.musclehub.backend.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    @Query("SELECT w FROM WorkoutPlan w LEFT JOIN FETCH w.member LEFT JOIN FETCH w.trainer")
    List<WorkoutPlan> findAllWithDetails();

    @Query("SELECT w FROM WorkoutPlan w LEFT JOIN FETCH w.member LEFT JOIN FETCH w.trainer WHERE w.member.id = :memberId")
    List<WorkoutPlan> findByMemberIdWithDetails(Long memberId);

    @Query("SELECT w FROM WorkoutPlan w LEFT JOIN FETCH w.member LEFT JOIN FETCH w.trainer WHERE w.member.id = :memberId AND w.status = :status")
    List<WorkoutPlan> findByMemberAndStatus(Long memberId, com.musclehub.backend.entity.WorkoutPlan.PlanStatus status);

    @Query("SELECT w FROM WorkoutPlan w LEFT JOIN FETCH w.member LEFT JOIN FETCH w.trainer WHERE w.trainer.id = :trainerId")
    List<WorkoutPlan> findByTrainerIdWithDetails(Long trainerId);

    @Query("SELECT w FROM WorkoutPlan w WHERE w.member.id = :memberId AND w.status = com.musclehub.backend.entity.WorkoutPlan$PlanStatus.CURRENT")
    List<WorkoutPlan> findCurrentPlansByMemberId(Long memberId);
}
