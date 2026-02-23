package com.musclehub.backend.repository;

import com.musclehub.backend.entity.TrainerSession;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainerSessionRepository extends JpaRepository<TrainerSession, Long> {
    List<TrainerSession> findAllByTrainer(User trainer);

    List<TrainerSession> findAllByMember(User member);
}
