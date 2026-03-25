package com.musclehub.backend.repository;

import com.musclehub.backend.entity.TrainerSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainerSlotRepository extends JpaRepository<TrainerSlot, Long> {
    List<TrainerSlot> findByTrainerUsername(String username);

    List<TrainerSlot> findByTrainerId(Long trainerId);
}
