package com.musclehub.backend.repository;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByMemberAndDate(User member, LocalDate date);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"workoutPlan"})
    List<WorkoutLog> findByMemberAndDateBetweenOrderByDateDesc(User member, LocalDate start, LocalDate end);

    List<WorkoutLog> findByMemberId(Long memberId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM WorkoutLog w WHERE w.member.id = :memberId")
    void deleteByUserId(Long memberId);
}
