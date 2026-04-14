package com.musclehub.backend.service;

import com.musclehub.backend.entity.ProgressLog;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.WorkoutAssignment;
import com.musclehub.backend.repository.ProgressLogRepository;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.WorkoutAssignmentRepository;
import com.musclehub.backend.entity.TrainerSession;
import com.musclehub.backend.repository.TrainerSessionRepository;
import com.musclehub.backend.entity.Inquiry;
import com.musclehub.backend.repository.InquiryRepository;
import com.musclehub.backend.entity.Equipment;
import com.musclehub.backend.repository.EquipmentRepository;
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
    private final InquiryRepository inquiryRepository;
    private final EquipmentRepository equipmentRepository;

    public void submitInquiry(String username, String subject, String message) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Inquiry inquiry = new Inquiry();
        inquiry.setUser(user);
        inquiry.setSubject(subject);
        inquiry.setMessage(message);
        inquiry.setStatus(Inquiry.Status.OPEN);
        inquiry.setCreatedAt(java.time.LocalDateTime.now());
        
        // Let inquiries be unassigned or auto-assign if they have a trainer
        if (user.getTrainer() != null && !subject.equals("Supplement Request")) {
            // "Supplement Request" might ideally go to Admin (unassigned), 
            // but for simplicity we'll just not assign to trainer if it's supplement related
            inquiry.setAssignedTo(user.getTrainer());
        }
        
        inquiryRepository.save(inquiry);
    }

    public List<Inquiry> getMyInquiries(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return inquiryRepository.findByUser(user);
    }

    public MemberProfileDTO getProfileDTO(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfileDTO dto = new MemberProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAge(user.getAge());
        dto.setHeight(user.getHeight());
        dto.setWeight(user.getWeight());
        dto.setGender(user.getGender());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setFitnessGoal(user.getFitnessGoal());
        dto.setAllergies(user.getAllergies());
        dto.setChest(user.getChest());
        dto.setWaist(user.getWaist());
        dto.setBiceps(user.getBiceps());
        dto.setThighs(user.getThighs());
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
        dto.setWalletBalance(user.getWalletBalance() != null ? user.getWalletBalance() : 0.0);
        dto.setDietaryPreference(user.getDietaryPreference() != null ? user.getDietaryPreference().name() : "NON_VEG");
        dto.setExcludedMeatTypes(user.getExcludedMeatTypes());
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

        user.setFirstName(profileData.getFirstName());
        user.setLastName(profileData.getLastName());
        user.setAge(profileData.getAge());
        user.setHeight(profileData.getHeight());
        user.setWeight(profileData.getWeight());
        user.setGender(profileData.getGender());
        user.setPhoneNumber(profileData.getPhoneNumber());
        user.setFitnessGoal(profileData.getFitnessGoal());
        user.setAllergies(profileData.getAllergies());
        user.setChest(profileData.getChest());
        user.setWaist(profileData.getWaist());
        user.setBiceps(profileData.getBiceps());
        user.setThighs(profileData.getThighs());
        user.setHealthDetails(profileData.getHealthDetails());
        user.setDietaryPreference(profileData.getDietaryPreference());
        user.setExcludedMeatTypes(profileData.getExcludedMeatTypes());

        userRepository.save(user);

        // Auto log progress on weight change
        ProgressLog log = new ProgressLog();
        log.setUser(user);
        log.setWeight(user.getWeight());
        log.setBmi(calculateBMI(user.getWeight(), user.getHeight()));
        log.setChest(user.getChest());
        log.setWaist(user.getWaist());
        log.setBiceps(user.getBiceps());
        log.setThighs(user.getThighs());
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

        // Protocol Check: Enforcement of "One Session Per Student Per Day" policy
        java.time.LocalDateTime startOfDay = slot.getStartTime().toLocalDate().atStartOfDay();
        java.time.LocalDateTime endOfDay = slot.getStartTime().toLocalDate().atTime(23, 59, 59);
        
        List<TrainerSession> existingOnDay = trainerSessionRepository.findMemberSessionsOnDay(member, startOfDay, endOfDay);
        if (!existingOnDay.isEmpty()) {
            throw new RuntimeException("Operational Protocol: You already have a session confirmed for this date (" + slot.getStartTime().toLocalDate() + "). Members are permitted only one session per day for health and safety reasons.");
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

    @Transactional
    public void cancelBooking(String memberUsername, Long sessionId) {
        if (sessionId == null) return;
        TrainerSession session = trainerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getMember().getUsername().equals(memberUsername)) {
            throw new RuntimeException("Unauthorized: You cannot cancel another member's booking.");
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime sessionTime = session.getSessionTime();

        // 10 hour rule
        if (now.plusHours(10).isAfter(sessionTime)) {
            throw new RuntimeException("Cancellations must be made at least 10 hours before the session start time.");
        }

        // Update Slot
        if (session.getSlot() != null) {
            com.musclehub.backend.entity.TrainerSlot slot = session.getSlot();
            if (slot != null && slot.getBookedCount() != null) {
                slot.setBookedCount(Math.max(0, slot.getBookedCount() - 1));
            }
            if (slot != null) {
                slot.setStatus("AVAILABLE");
                trainerSlotRepository.save(slot);
            }
        }

        trainerSessionRepository.delete(session);
    }

    @Transactional(readOnly = true)
    public List<Equipment> getAllEquipmentStatus() {
        return equipmentRepository.findAll();
    }
}
