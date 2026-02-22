package com.musclehub.backend.service;

import com.musclehub.backend.entity.ProgressLog;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutAssignment;
import com.musclehub.backend.repository.ProgressLogRepository;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.WorkoutAssignmentRepository;
import com.musclehub.backend.entity.TrainerSession;
import com.musclehub.backend.repository.TrainerSessionRepository;
import com.musclehub.backend.dto.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final UserRepository userRepository;
    private final ProgressLogRepository progressLogRepository;
    private final WorkoutAssignmentRepository workoutAssignmentRepository;
    private final TrainerSessionRepository trainerSessionRepository;
    private final com.musclehub.backend.repository.TrainerSlotRepository trainerSlotRepository;

    public MemberProfileDTO getProfileDTO(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfileDTO dto = new MemberProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAge(user.getAge());
        dto.setHeight(user.getHeight());
        dto.setWeight(user.getWeight());
        dto.setGender(user.getGender());
        dto.setHealthDetails(user.getHealthDetails());
        dto.setLoyaltyPoints(user.getLoyaltyPoints());
        if (user.getTrainer() != null) {
            dto.setTrainerName(user.getTrainer().getUsername());
            dto.setTrainerId(user.getTrainer().getId());
        }
        if (user.getMembershipStatus() != null) {
            dto.setMembershipStatus(user.getMembershipStatus().name());
        } else {
            dto.setMembershipStatus("NONE");
        }
        if (user.getActivePackage() != null) {
            dto.setActivePackageName(user.getActivePackage().getName());
            dto.setActivePackagePrice(user.getActivePackage().getPrice());
            dto.setActivePackageDuration(user.getActivePackage().getDurationMonths());
        }
        return dto;
    }

    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String currentUsername, User profileData) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update Username
        if (profileData.getUsername() != null && !profileData.getUsername().isEmpty()
                && !profileData.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(profileData.getUsername())) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(profileData.getUsername());
        }

        // Update Email
        if (profileData.getEmail() != null && !profileData.getEmail().isEmpty()
                && !profileData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(profileData.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(profileData.getEmail());
        }

        user.setAge(profileData.getAge());
        user.setHeight(profileData.getHeight());
        user.setWeight(profileData.getWeight());
        user.setHealthDetails(profileData.getHealthDetails());

        userRepository.save(user);

        // Auto log progress on weight change
        ProgressLog log = new ProgressLog();
        log.setUser(user);
        log.setWeight(user.getWeight());
        log.setBmi(calculateBMI(user.getWeight(), user.getHeight()));
        log.setLogDate(java.time.LocalDateTime.now());
        progressLogRepository.save(log);

        return user;
    }

    public List<ProgressLog> getProgressLogs(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return progressLogRepository.findByUserOrderByLogDateDesc(user);
    }

    private Double calculateBMI(Double weight, Double height) {
        if (height == null || height <= 0)
            return 0.0;
        double heightInMeters = height / 100.0;
        return weight / (heightInMeters * heightInMeters);
    }

    public Optional<WorkoutAssignment> getLatestWorkoutAssignment(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return workoutAssignmentRepository.findFirstByMemberOrderByAssignedDateDesc(user);
    }

    public List<TrainerSessionDTO> getMySessions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return trainerSessionRepository.findAllByMember(user).stream()
                .map(TrainerSessionDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<UserDTO> getAllTrainers() {
        System.out.println(">>> Fetching all active trainers...");
        try {
            List<UserDTO> trainers = userRepository.findAllByRoleAndIsActiveTrue(User.Role.TRAINER).stream()
                    .map(UserDTO::new)
                    .collect(java.util.stream.Collectors.toList());
            System.out.println(">>> Found " + trainers.size() + " active trainers");
            return trainers;
        } catch (Exception e) {
            System.err.println(">>> Error in getAllTrainers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<TrainerSlotDTO> getTrainerSlots(Long trainerId) {
        // Return only upcoming slots (from now onwards)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        return trainerSlotRepository.findByTrainerId(trainerId).stream()
                .filter(slot -> slot.getStartTime().isAfter(now))
                .sorted(java.util.Comparator.comparing(com.musclehub.backend.entity.TrainerSlot::getStartTime))
                .map(TrainerSlotDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    public void bookSlot(String memberUsername, Long slotId) {
        if (slotId == null) {
            throw new RuntimeException("Slot ID required");
        }
        User member = userRepository.findByUsername(memberUsername)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        com.musclehub.backend.entity.TrainerSlot slot = trainerSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new RuntimeException("Slot is full");
        }

        // Prevent double booking
        boolean alreadyBooked = trainerSessionRepository.findAllByMember(member).stream()
                .anyMatch(s -> s.getSlot() != null && s.getSlot().getId().equals(slotId));

        if (alreadyBooked) {
            throw new RuntimeException("You have already booked this slot");
        }

        TrainerSession session = new TrainerSession();
        session.setTrainer(slot.getTrainer());
        session.setMember(member);
        session.setSlot(slot);
        session.setSessionTime(slot.getStartTime()); // Use slot start time
        session.setSessionType("Standard Session");
        session.setVenue("Gym Floor");
        session.setStatus("UPCOMING");

        trainerSessionRepository.save(session);

        // Auto-assign trainer if member has none
        if (member.getTrainer() == null) {
            member.setTrainer(slot.getTrainer());
            userRepository.save(member);
        }

        slot.setBookedCount(slot.getBookedCount() + 1);
        if (slot.getBookedCount() >= slot.getCapacity()) {
            slot.setStatus("FULL");
        }
        trainerSlotRepository.save(slot);
    }

    public void cancelBooking(String memberUsername, Long sessionId) {
        TrainerSession session = trainerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!session.getMember().getUsername().equals(memberUsername)) {
            throw new RuntimeException("Unauthorized: This appointment does not belong to you");
        }

        // Check 1-hour constraint
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (session.getSessionTime().isBefore(now.plusHours(1))) {
            throw new RuntimeException("Cannot cancel an appointment less than 1 hour before it starts");
        }

        // Update Slot
        com.musclehub.backend.entity.TrainerSlot slot = session.getSlot();
        if (slot != null) {
            slot.setBookedCount(Math.max(0, slot.getBookedCount() - 1));
            if (slot.getBookedCount() < slot.getCapacity()) {
                slot.setStatus("AVAILABLE");
            }
            trainerSlotRepository.save(slot);
        }

        // Delete Session
        trainerSessionRepository.delete(session);
    }
}
