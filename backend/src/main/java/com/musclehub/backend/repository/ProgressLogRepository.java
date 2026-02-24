package com.musclehub.backend.repository;

import com.musclehub.backend.entity.ProgressLog;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {
    List<ProgressLog> findAllByUserOrderByLogDateAsc(User user);

    List<ProgressLog> findByUserOrderByLogDateDesc(User user);
}
