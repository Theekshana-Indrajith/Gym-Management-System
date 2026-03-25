package com.musclehub.backend.service;

import com.musclehub.backend.dto.InquiryDTO;
import com.musclehub.backend.dto.TrainerSessionDTO;
import com.musclehub.backend.dto.TrainerSlotDTO;
import com.musclehub.backend.dto.UserDTO;
import com.musclehub.backend.entity.*;
import com.musclehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainerService {

        private final UserRepository userRepository;
        private final AttendanceRepository attendanceRepository;
        private final EquipmentRepository equipmentRepository;
        private final WorkoutAssignmentRepository workoutAssignmentRepository;
        private final InquiryRepository inquiryRepository;
        private final TrainerSessionRepository trainerSessionRepository;
        private final TrainerSlotRepository trainerSlotRepository;
        private final MaintenanceLogRepository maintenanceLogRepository;
        private final ProgressLogRepository progressLogRepository;

        public List<UserDTO> getMyMembers(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                return userRepository.findAllByTrainer(trainer).stream()
                                .map(UserDTO::new)
                                .toList();
        }

        public void markAttendance(Long memberId, String status) {
                if (memberId == null)
                        return;
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                Attendance attendance = new Attendance();
                attendance.setUser(member);
                attendance.setDate(LocalDate.now());
                attendance.setStatus(Attendance.Status.valueOf(status.toUpperCase()));
                attendanceRepository.save(attendance);
        }

        public void assignWorkout(String trainerUsername, Long memberId, String workoutContent, String dietContent) {
                if (memberId == null)
                        return;
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                WorkoutAssignment assignment = new WorkoutAssignment();
                assignment.setTrainer(trainer);
                assignment.setMember(member);
                assignment.setWorkoutContent(workoutContent);
                assignment.setDietContent(dietContent);
                assignment.setAssignedDate(LocalDate.now());
                workoutAssignmentRepository.save(assignment);
        }

        public void updateEquipmentStatus(Long equipmentId, String status) {
                if (equipmentId == null || status == null)
                        return;
                Equipment equipment = equipmentRepository.findById(equipmentId)
                                .orElseThrow(() -> new RuntimeException("Equipment not found"));
                try {
                        equipment.setStatus(Equipment.Status.valueOf(status.toUpperCase()));
                        equipmentRepository.save(equipment);
                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid status: " + status);
                }
        }

        public MaintenanceLog logRepairAction(Long equipmentId, String trainerUsername, String action, String notes,
                        Double cost) {
                if (equipmentId == null)
                        throw new RuntimeException("Equipment ID is null");
                Equipment equipment = equipmentRepository.findById(equipmentId)
                                .orElseThrow(() -> new RuntimeException("Equipment not found"));
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                MaintenanceLog log = new MaintenanceLog();
                log.setEquipment(equipment);
                log.setTechnician(trainer);
                log.setActionTaken(action);
                log.setNotes(notes);
                log.setRepairCost(cost != null ? cost : 0.0);
                log.setStatus(MaintenanceLog.LogStatus.COMPLETED);
                log.setResolveDate(LocalDateTime.now());

                equipment.setStatus(Equipment.Status.WORKING);
                equipment.setLastMaintenanceDate(LocalDate.now());
                equipmentRepository.save(equipment);

                return maintenanceLogRepository.save(log);
        }

        public MaintenanceLog reportEquipmentIssue(Long equipmentId, String trainerUsername, String issueType,
                        String urgency, String description) {
                if (equipmentId == null)
                        throw new RuntimeException("Equipment ID is null");
                Equipment equipment = equipmentRepository.findById(equipmentId)
                                .orElseThrow(() -> new RuntimeException("Equipment not found"));
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                MaintenanceLog log = new MaintenanceLog();
                log.setEquipment(equipment);
                log.setReportedBy(trainer);
                log.setIssueType(issueType);
                log.setUrgency(urgency);
                log.setDescription(description);
                log.setStatus(MaintenanceLog.LogStatus.PENDING);

                equipment.setStatus(Equipment.Status.BROKEN);
                equipmentRepository.save(equipment);

                return maintenanceLogRepository.save(log);
        }

        public void replyToInquiry(Long inquiryId, String reply, String trainerUsername) {
                if (inquiryId == null)
                        return;
                Inquiry inquiry = inquiryRepository.findById(inquiryId)
                                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                inquiry.setReply(reply);
                inquiry.setAssignedTo(trainer);
                inquiry.setStatus(Inquiry.Status.CLOSED);
                inquiry.setRepliedAt(LocalDateTime.now());
                inquiryRepository.save(inquiry);
        }

        public List<Equipment> getAllEquipment() {
                return equipmentRepository.findAll();
        }

        public List<InquiryDTO> getMyInquiries(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return inquiryRepository.findByAssignedTo(trainer).stream()
                                .map(InquiryDTO::new)
                                .toList();
        }

        public List<TrainerSessionDTO> getMySessions(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return trainerSessionRepository.findAllByTrainer(trainer).stream()
                                .map(TrainerSessionDTO::new)
                                .toList();
        }

        public TrainerSessionDTO addSession(String trainerUsername, Long memberId, String type, String venue,
                        LocalDateTime time) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                TrainerSession session = new TrainerSession();
                session.setTrainer(trainer);
                session.setMember(member);
                session.setSessionType(type);
                session.setVenue(venue);
                session.setSessionTime(time);
                session.setStatus("UPCOMING");
                return new TrainerSessionDTO(trainerSessionRepository.save(session));
        }

        public void completeSession(Long sessionId, String status, String notes) {
                if (sessionId == null)
                        return;
                TrainerSession session = trainerSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new RuntimeException("Session not found"));
                session.setStatus(status != null ? status : "COMPLETED");
                session.setNotes(notes);
                trainerSessionRepository.save(session);
        }

        public TrainerSlotDTO createSlot(String trainerUsername, LocalDateTime start, LocalDateTime end,
                        Integer capacity) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                TrainerSlot slot = new TrainerSlot();
                slot.setTrainer(trainer);
                slot.setStartTime(start);
                slot.setEndTime(end);
                slot.setCapacity(capacity != null ? capacity : 1);
                slot.setBookedCount(0);
                slot.setStatus("AVAILABLE");
                return new TrainerSlotDTO(trainerSlotRepository.save(slot));
        }

        public List<TrainerSlotDTO> getMySlots(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return trainerSlotRepository.findByTrainerId(trainer.getId()).stream()
                                .map(TrainerSlotDTO::new)
                                .toList();
        }

        @Transactional
        public TrainerSlotDTO updateSlot(Long slotId, Integer newCapacity, LocalDateTime newStart, LocalDateTime newEnd) {
                TrainerSlot slot = trainerSlotRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                // Constraint 1: If anyone has booked, cannot change time
                if (slot.getBookedCount() > 0) {
                        // Only allow capacity update
                        if (newCapacity != null) {
                                if (newCapacity < slot.getBookedCount()) {
                                        throw new RuntimeException("New capacity cannot be less than current bookings");
                                }
                                slot.setCapacity(newCapacity);
                                if (slot.getBookedCount() < slot.getCapacity()) {
                                        slot.setStatus("AVAILABLE");
                                }
                        } else {
                                throw new RuntimeException("Slot is already booked. You can only increase capacity.");
                        }
                } else {
                        // Nobody booked, free to change everything
                        if (newCapacity != null)
                                slot.setCapacity(newCapacity);
                        if (newStart != null)
                                slot.setStartTime(newStart);
                        if (newEnd != null)
                                slot.setEndTime(newEnd);
                }

                return new TrainerSlotDTO(trainerSlotRepository.save(slot));
        }

        @Transactional
        public void deleteSlot(Long slotId) {
                TrainerSlot slot = trainerSlotRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                if (slot.getBookedCount() > 0) {
                        throw new RuntimeException("Cannot delete a slot that has active bookings.");
                }

                // Explicitly break the link in all sessions associated with this slot
                // because we want to KEEP the sessions (history) but DELETE the slot (template)
                List<TrainerSession> linkedSessions = trainerSessionRepository.findBySlotId(slotId);
                for (TrainerSession session : linkedSessions) {
                        session.setSlot(null);
                        trainerSessionRepository.save(session);
                }
                
                // Flush changes before deletion to satisfy constraints
                trainerSessionRepository.flush();

                trainerSlotRepository.delete(slot);
        }

        public void bookSlot(String memberUsername, Long slotId) {
                User member = userRepository.findByUsername(memberUsername)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                TrainerSlot slot = trainerSlotRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                if (slot.getBookedCount() >= slot.getCapacity()) {
                        throw new RuntimeException("Slot is full");
                }

                TrainerSession session = new TrainerSession();
                session.setTrainer(slot.getTrainer());
                session.setMember(member);
                session.setSlot(slot);
                session.setSessionTime(slot.getStartTime());
                session.setSessionType("Standard Session");
                session.setVenue("Gym Floor");
                session.setStatus("UPCOMING");

                trainerSessionRepository.save(session);

                slot.setBookedCount(slot.getBookedCount() + 1);
                if (slot.getBookedCount() >= slot.getCapacity()) {
                        slot.setStatus("FULL");
                }
                trainerSlotRepository.save(slot);
        }

        @Transactional
        public void updateMemberFitnessData(Long memberId, UserDTO fitnessData) {
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                if (fitnessData.getAge() != null)
                        member.setAge(fitnessData.getAge());
                if (fitnessData.getHeight() != null)
                        member.setHeight(fitnessData.getHeight());
                if (fitnessData.getWeight() != null)
                        member.setWeight(fitnessData.getWeight());
                if (fitnessData.getGender() != null)
                        member.setGender(fitnessData.getGender());
                if (fitnessData.getPhoneNumber() != null)
                        member.setPhoneNumber(fitnessData.getPhoneNumber());
                if (fitnessData.getFitnessGoal() != null)
                        member.setFitnessGoal(fitnessData.getFitnessGoal());
                if (fitnessData.getAllergies() != null)
                        member.setAllergies(fitnessData.getAllergies());
                if (fitnessData.getChest() != null)
                        member.setChest(fitnessData.getChest());
                if (fitnessData.getWaist() != null)
                        member.setWaist(fitnessData.getWaist());
                if (fitnessData.getBiceps() != null)
                        member.setBiceps(fitnessData.getBiceps());
                if (fitnessData.getThighs() != null)
                        member.setThighs(fitnessData.getThighs());
                if (fitnessData.getHealthDetails() != null)
                        member.setHealthDetails(fitnessData.getHealthDetails());

                userRepository.save(member);

                // Auto log progress for trainer updates
                ProgressLog log = new ProgressLog();
                log.setUser(member);
                log.setWeight(member.getWeight());
                log.setBmi(calculateBMI(member.getWeight(), member.getHeight()));
                log.setChest(member.getChest());
                log.setWaist(member.getWaist());
                log.setBiceps(member.getBiceps());
                log.setThighs(member.getThighs());
                log.setLogDate(java.time.LocalDateTime.now());
                progressLogRepository.save(log);
        }

        private Double calculateBMI(Double weight, Double height) {
                if (height == null || height <= 0 || weight == null)
                        return 0.0;
                double heightInMeters = height / 100.0;
                return weight / (heightInMeters * heightInMeters);
        }

        public List<ProgressLog> getMemberProgress(Long memberId) {
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));
                return progressLogRepository.findAllByUserOrderByLogDateAsc(member);
        }

        public UserDTO getProfile(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return new UserDTO(user);
        }

        public void updateProfile(String username, UserDTO profileData) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (profileData.getFirstName() != null)
                        user.setFirstName(profileData.getFirstName());
                if (profileData.getLastName() != null)
                        user.setLastName(profileData.getLastName());
                if (profileData.getEmail() != null)
                        user.setEmail(profileData.getEmail());
                if (profileData.getPhoneNumber() != null)
                        user.setPhoneNumber(profileData.getPhoneNumber());
                if (profileData.getQualification() != null)
                        user.setQualification(profileData.getQualification());
                if (profileData.getAge() != null)
                        user.setAge(profileData.getAge());
                if (profileData.getGender() != null)
                        user.setGender(profileData.getGender());

                userRepository.save(user);
        }
}
