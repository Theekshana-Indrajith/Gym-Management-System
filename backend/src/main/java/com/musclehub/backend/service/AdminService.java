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
    private final MembershipRequestRepository membershipRequestRepository;
    private final SupplementOrderRepository supplementOrderRepository;
    private final AttendanceRepository attendanceRepository;

    public List<UserDTO> getAllUsersByRole(User.Role role) {
        return userRepository.findAllByRole(role).stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public DashboardStats getStats() {
        long admins = userRepository.findAllByRole(User.Role.ADMIN).size();
        long trainers = userRepository.findAllByRole(User.Role.TRAINER).size();
        long members = userRepository.findAllByRole(User.Role.MEMBER).size();

        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        double membershipRevenue = membershipRequestRepository.findAllByStatus(MembershipRequest.Status.APPROVED)
                .stream()
                .filter(req -> req.getProcessedDate() != null && req.getProcessedDate().isAfter(startOfMonth))
                .mapToDouble(
                        req -> (req.getMembershipPackage() != null && req.getMembershipPackage().getPrice() != null)
                                ? req.getMembershipPackage().getPrice()
                                : 0.0)
                .sum();

        double supplementRevenue = supplementOrderRepository.findAll().stream()
                .filter(order -> order.getOrderDate() != null && order.getOrderDate().isAfter(startOfMonth))
                .mapToDouble(order -> order.getTotalPrice() != null ? order.getTotalPrice() : 0.0)
                .sum();

        double totalRevenue = membershipRevenue + supplementRevenue;

        long lowStock = supplementRepository.findByStockLessThan(10).size();
        long checkins = attendanceRepository.findByDate(java.time.LocalDate.now()).size();

        return new DashboardStats(admins, trainers, members, totalRevenue, lowStock, checkins);
    }

    public void deleteUser(Long id) {
        if (id == null)
            return;
        userRepository.deleteById(id);
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
        return new AuthResponse("User added successfully", user.getId(), user.getUsername(), user.getRole());
    }

    public void assignTrainerToMember(Long memberId, Long trainerId) {
        if (memberId == null || trainerId == null)
            return;
        User member = userRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));
        User trainer = userRepository.findById(trainerId).orElseThrow(() -> new RuntimeException("Trainer not found"));
        member.setTrainer(trainer);
        userRepository.save(member);
    }

    // Equipment Management
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment addEquipment(Equipment equipment) {
        if (equipment == null)
            throw new RuntimeException("Equipment data is null");
        return equipmentRepository.save(equipment);
    }

    public Equipment updateEquipment(Long id, Equipment updated) {
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        if (updated.getName() != null)
            existing.setName(updated.getName());
        if (updated.getStatus() != null)
            existing.setStatus(updated.getStatus());
        if (updated.getLastMaintenanceDate() != null)
            existing.setLastMaintenanceDate(updated.getLastMaintenanceDate());
        if (updated.getNextMaintenanceDate() != null)
            existing.setNextMaintenanceDate(updated.getNextMaintenanceDate());
        return equipmentRepository.save(existing);
    }

    public void deleteEquipment(Long id) {
        if (id == null)
            return;
        equipmentRepository.deleteById(id);
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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<SupplementOrderDTO> getAllSupplementOrders() {
        try {
            return supplementOrderRepository.findAllWithDetails().stream()
                    .map(order -> new SupplementOrderDTO(
                            order.getId(),
                            order.getUser() != null ? order.getUser().getUsername() : "N/A",
                            order.getUser() != null ? order.getUser().getEmail() : "N/A",
                            order.getSupplement() != null ? order.getSupplement().getName() : "Unknown",
                            order.getSupplement() != null ? order.getSupplement().getCategory() : "N/A",
                            order.getQuantity(),
                            order.getTotalPrice(),
                            order.getOrderDate()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log and return empty to avoid 500
            return List.of();
        }
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
