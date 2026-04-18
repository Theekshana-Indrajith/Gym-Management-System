package com.musclehub.backend.repository;

import com.musclehub.backend.entity.TrainerSession;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainerSessionRepository extends JpaRepository<TrainerSession, Long> {
    List<TrainerSession> findAllByTrainer(User trainer);

    List<TrainerSession> findAllByMember(User member);

    List<TrainerSession> findBySlotId(Long slotId);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM TrainerSession s WHERE s.member = :member AND s.sessionTime >= :startOfDay AND s.sessionTime <= :endOfDay AND s.status != 'CANCELLED'")
    List<TrainerSession> findMemberSessionsOnDay(
        @org.springframework.data.repository.query.Param("member") User member, 
        @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay, 
        @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay
    );

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM TrainerSession t WHERE t.trainer.id = :id")
    void deleteByTrainerId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM TrainerSession t WHERE t.member.id = :id")
    void deleteByMemberId(Long id);
}
