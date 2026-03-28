package com.musclehub.backend.repository;

import com.musclehub.backend.entity.TrainerSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TrainerSlotRepository extends JpaRepository<TrainerSlot, Long> {
    List<TrainerSlot> findByTrainerUsername(String username);

    List<TrainerSlot> findByTrainerId(Long trainerId);

    @Query("SELECT s FROM TrainerSlot s WHERE s.startTime < :endTime AND s.endTime > :startTime")
    List<TrainerSlot> findOverlappingSlots(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM TrainerSlot t WHERE t.trainer.id = :id")
    void deleteByTrainerId(Long id);
}
