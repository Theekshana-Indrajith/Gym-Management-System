package com.musclehub.backend.service;

import com.musclehub.backend.entity.Notification;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.NotificationRepository;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<Notification> getGlobalNotifications() {
        return notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
    }

    public List<Notification> getMyNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getMyUnreadNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void createGlobalNotification(String title, String message, String type) {
        // Find all members
        List<User> members = userRepository.findAllByRole(User.Role.MEMBER);

        for (User member : members) {
            // Create in-app notification for each user
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setUser(member); // Assign to specific user
            notificationRepository.save(notification);

            // Send email
            if (member.getEmail() != null && !member.getEmail().isEmpty()) {
                String emailBody = "Hello " + member.getUsername() + ",\n\n" +
                        "Dynamic Update from MuscleHub:\n\n" +
                        title + "\n" +
                        message + "\n\n" +
                        "Check it out in your dashboard!\n\n" +
                        "Best regards,\nMuscleHub Team";

                emailService.sendEmail(member.getEmail(), "MuscleHub Update: " + title, emailBody);
            }
        }
    }

    @Transactional
    public void createAdminNotification(String title, String message, String type) {
        // Find all admins
        List<User> admins = userRepository.findAllByRole(User.Role.ADMIN);

        for (User admin : admins) {
            // Create in-app notification for each admin
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setUser(admin); // Assign to specific user
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
