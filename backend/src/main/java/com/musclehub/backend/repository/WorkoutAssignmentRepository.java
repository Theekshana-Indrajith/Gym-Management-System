package com.musclehub.backend.repository;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WorkoutAssignmentRepository extends JpaRepository<WorkoutAssignment, Long> {
    Optional<WorkoutAssignment> findFirstByMemberOrderByAssignedDateDesc(User member);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM WorkoutAssignment w WHERE w.member.id = :id")
    void deleteByMemberId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM WorkoutAssignment w WHERE w.trainer.id = :id")
    void deleteByTrainerId(Long id);
}
