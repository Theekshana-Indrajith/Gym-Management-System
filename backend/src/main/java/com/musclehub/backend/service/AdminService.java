package com.musclehub.backend.service;

import com.musclehub.backend.dto.*;
import com.musclehub.backend.entity.*;
import com.musclehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
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

    public void deleteUser(Long id) {
        if (id == null)
            return;
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
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    public void replyToInquiry(Long id, String reply) {
        if (id == null)
            return;
        Inquiry inquiry = inquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setReply(reply);
        inquiry.setStatus(Inquiry.Status.CLOSED);
        inquiryRepository.save(inquiry);
    }
}
