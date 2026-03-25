package com.musclehub.backend.repository;

import com.musclehub.backend.entity.Notification;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);

    // For global notifications (where user is null)
    List<Notification> findByUserIsNullOrderByCreatedAtDesc();
}
