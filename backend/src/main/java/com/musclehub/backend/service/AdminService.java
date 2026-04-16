package com.musclehub.backend.service;

import com.musclehub.backend.dto.*;
import com.musclehub.backend.entity.*;
import com.musclehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EquipmentRepository equipmentRepository;
    private final SupplementRepository supplementRepository;
    private final InquiryRepository inquiryRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final NotificationRepository notificationRepository;

    public List<UserDTO> getAllUsersByRole(User.Role role) {
        return userRepository.findAllByRole(role).stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public DashboardStats getStats() {
        long admins = userRepository.findAllByRole(User.Role.ADMIN).size();
        long trainers = userRepository.findAllByRole(User.Role.TRAINER).size();
        long members = userRepository.findAllByRole(User.Role.MEMBER).size();
        return new DashboardStats(admins, trainers, members);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        if (id == null) return;
        
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return;

        // 1. Cleanup References where user is a TRAINER for others
        userRepository.findAllByTrainer(user).forEach(member -> {
            member.setTrainer(null);
            userRepository.save(member);
        });

        // 2. Nullify references that should be preserved for history
        maintenanceLogRepository.nullifyReportedBy(id);
        maintenanceLogRepository.nullifyTechnician(id);
        inquiryRepository.deleteByAssignedToId(id);

        // 3. Cleanup Module Data (Delete user-specific records)
        notificationRepository.deleteByUserId(id);
        inquiryRepository.deleteByUserId(id);
        progressLogRepository.deleteByUserId(id);
        attendanceRepository.deleteByUserId(id);
        membershipRequestRepository.deleteByUserId(id);
        
        // Workout related
        workoutLogRepository.deleteByUserId(id);
        workoutAssignmentRepository.deleteByMemberId(id);
        workoutAssignmentRepository.deleteByTrainerId(id);
        workoutPlanRepository.deleteByMemberId(id);
        workoutPlanRepository.deleteByTrainerId(id);
        
        // Meal plans
        mealPlanRepository.deleteByMemberId(id);
        mealPlanRepository.deleteByTrainerId(id);
        
        // Supplements
        supplementOrderRepository.deleteByUserId(id);

        // Trainer specific
        if (user.getRole() == User.Role.TRAINER) {
            trainerSlotRepository.deleteByTrainerId(id);
            trainerSessionRepository.deleteByTrainerId(id);
        }
        trainerSessionRepository.deleteByMemberId(id);

        // 4. Final Deletion
        userRepository.deleteById(id);
    }

    public UserDTO toggleUserStatus(Long id) {
        if (id == null)
            throw new RuntimeException("ID is null");
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        return new UserDTO(userRepository.save(user));
    }

    public AuthResponse addUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);
        return new AuthResponse("User added successfully", user.getUsername(), user.getRole(), user.getId());
    }

    public void assignTrainerToMember(Long memberId, Long trainerId) {
        if (memberId == null || trainerId == null)
            return;
        User member = userRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));
        User trainer = userRepository.findById(trainerId).orElseThrow(() -> new RuntimeException("Trainer not found"));
        member.setTrainer(trainer);
        userRepository.save(member);
    }

    // Equipment Management (Advanced Owner/Admin Control)
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment addEquipment(Equipment equipment) {
        if (equipment == null)
            throw new RuntimeException("Equipment data is null");
        if (equipment.getCost() == null || equipment.getCost() < 0) {
            throw new RuntimeException("Equipment cost cannot be negative");
        }
        if (equipment.getName() == null || equipment.getName().trim().isEmpty()) {
            throw new RuntimeException("Equipment name is required");
        }
        return equipmentRepository.save(equipment);
    }

    public Equipment updateEquipment(Long id, Equipment data) {
        if (id == null)
            throw new RuntimeException("ID is null");
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        existing.setName(data.getName());
        existing.setBrand(data.getBrand());
        existing.setSerialNumber(data.getSerialNumber());
        existing.setLocation(data.getLocation());
        existing.setStatus(data.getStatus());
        existing.setEquipmentCondition(data.getEquipmentCondition());
        existing.setNextMaintenanceDate(data.getNextMaintenanceDate());
        existing.setCost(data.getCost());
        
        // Alternative Recommendation Sync
        existing.setAlternativeId(data.getAlternativeId());
        existing.setAlternativeName(data.getAlternativeName());

        return equipmentRepository.save(existing);
    }

    public void deleteEquipment(Long id) {
        if (id == null)
            return;
        equipmentRepository.deleteById(id);
    }

    public void deactivateEquipment(Long id) {
        if (id == null)
            throw new RuntimeException("ID is null");
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        existing.setStatus(Equipment.Status.DEACTIVATED);
        equipmentRepository.save(existing);
    }

    public void resolveEquipment(Long equipmentId, String adminUsername, String action, String notes, Double cost) {
        if (equipmentId == null)
            throw new RuntimeException("ID is null");
        Equipment existing = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        existing.setStatus(Equipment.Status.WORKING);
        existing.setLastMaintenanceDate(java.time.LocalDate.now());
        equipmentRepository.save(existing);

        // Update the most recent PENDING maintenance log for this equipment
        maintenanceLogRepository.findRecentByEquipmentAndStatus(equipmentId, MaintenanceLog.LogStatus.PENDING).stream().findFirst()
            .ifPresent(log -> {
                log.setStatus(MaintenanceLog.LogStatus.COMPLETED);
                log.setActionTaken(action);
                log.setNotes(notes);
                log.setRepairCost(cost != null ? cost : 0.0);
                log.setResolveDate(java.time.LocalDateTime.now());
                log.setTechnician(admin);
                maintenanceLogRepository.save(log);

                // Notify reporting trainer
                if (log.getReportedBy() != null) {
                    Notification notification = new Notification();
                    notification.setUser(log.getReportedBy());
                    notification.setTitle("Equipment Fixed: " + existing.getName());
                    notification.setMessage("The issue you reported ('" + log.getIssueType() + "') has been resolved: " + action);
                    notification.setCreatedAt(java.time.LocalDateTime.now());
                    notification.setRead(false);
                    notificationRepository.save(notification);
                }
            });
    }

    public List<MaintenanceLog> getMaintenanceHistory(Long equipmentId) {
        return maintenanceLogRepository.findByEquipmentIdOrderByLogDateDesc(equipmentId);
    }

    // AI-Based Optimization Recommendation (Mock)
    public List<String> getAIOptimizationInsights() {
        return List.of(
                "Treadmill #04 usage is 40% higher than average. Recommend rotation to Zone B to equalize motor wear.",
                "Smith Machine #01 showing vibration patterns consistent with bearing fatigue. Schedule preventive check-up.",
                "Bench Press area optimization: 85% occupancy during peak hours. Recommend adding 2 more adjustable benches.",
                "Kettlebell set incomplete. Detected missing 16kg unit for 48 hours.");
    }

    // Inventory Management
    public List<Supplement> getAllSupplements() {
        return supplementRepository.findAll();
    }

    public Supplement addSupplement(Supplement supplement) {
        if (supplement == null)
            throw new RuntimeException("Supplement data is null");
        return supplementRepository.save(supplement);
    }

    public List<Supplement> getLowStockSupplements() {
        return supplementRepository.findByStockLessThan(10);
    }

    // Feedback Management
    public List<InquiryDTO> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(InquiryDTO::new)
                .collect(Collectors.toList());
    }

    public void replyToInquiry(Long id, String reply) {
        if (id == null)
            return;
        Inquiry inquiry = inquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setReply(reply);
        inquiry.setStatus(Inquiry.Status.CLOSED);
        inquiry.setRepliedAt(java.time.LocalDateTime.now());
        inquiryRepository.save(inquiry);

        // Notify member via Notification System if it's a registered user
        if (inquiry.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(inquiry.getUser());
            notification.setTitle("Response: " + inquiry.getSubject());
            notification.setMessage("Admin has replied: " + reply);
            notification.setType("INQUIRY_REPLY");
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);
        }

        // Send Email
        String targetEmail = inquiry.getSenderEmail();
        if (targetEmail == null && inquiry.getUser() != null) {
            targetEmail = inquiry.getUser().getEmail();
        }

        if (targetEmail != null) {
            try {
                mailService.sendEmail(
                    targetEmail, 
                    "RE: " + inquiry.getSubject() + " - MuscleHub Support",
                    "Hello " + (inquiry.getSenderName() != null ? inquiry.getSenderName() : "Member") + ",\n\n" +
                    "Our management team has responded to your inquiry:\n\n" +
                    "\"" + reply + "\"\n\n" +
                    "Best regards,\nMuscleHub Team"
                );
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }
    }
}
