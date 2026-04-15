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
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

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
        private final NotificationRepository notificationRepository;
        private final EmailService emailService;

        public List<UserDTO> getMyMembers(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                // User a Map keyed by ID to ensure distinct members even if loaded through different relationships
                java.util.Map<Long, User> membersMap = new java.util.HashMap<>();

                // 1. Members directly assigned to this trainer via the 'trainer' field
                userRepository.findAllByTrainer(trainer).forEach(u -> membersMap.put(u.getId(), u));

                // 2. Members who have booked sessions (historical or upcoming) with this trainer
                trainerSessionRepository.findAllByTrainer(trainer).forEach(session -> {
                        if (session.getMember() != null) {
                                membersMap.put(session.getMember().getId(), session.getMember());
                        }
                });

                return membersMap.values().stream()
                                .map(UserDTO::new)
                                .sorted((a, b) -> a.getUsername().compareToIgnoreCase(b.getUsername()))
                                .toList();
        }

        public java.util.Map<String, Object> getTrainerStats(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                long totalMembers = getMyMembers(trainerUsername).size();

                long completedSessions = trainerSessionRepository.findAllByTrainer(trainer).stream()
                                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                                .count();

                long pendingInquiries = inquiryRepository.findByAssignedTo(trainer).stream()
                                .filter(i -> i.getReply() == null || i.getReply().isEmpty())
                                .count();

                long totalEquipment = equipmentRepository.count();
                long workingEquipment = equipmentRepository.findAll().stream()
                                .filter(e -> Equipment.Status.WORKING == e.getStatus())
                                .count();

        return java.util.Map.of(
                                "totalMembers", totalMembers,
                                "completedSessions", completedSessions,
                                "pendingInquiries", pendingInquiries,
                                "totalEquipment", totalEquipment,
                                "workingEquipment", workingEquipment);
        }

        public java.util.Map<String, Object> getTrainerAlerts(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                                
                long pendingSessions = trainerSessionRepository.findAllByTrainer(trainer).stream()
                                .filter(s -> "UPCOMING".equalsIgnoreCase(s.getStatus()))
                                .count();

                // If adding more later (like chat messages), add them here
                return java.util.Map.of(
                    "schedule", pendingSessions,
                    "total", pendingSessions
                );
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

                // Send Notification to User
                if (inquiry.getUser() != null) {
                    Notification notification = new Notification();
                    notification.setUser(inquiry.getUser());
                    notification.setTitle("Response: " + inquiry.getSubject());
                    notification.setMessage(trainer.getUsername() + " has replied: " + reply);
                    notification.setType("INQUIRY_REPLY");
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setRead(false);
                    notificationRepository.save(notification);
                }
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

                // Protocol Check: Enforcement of "One Session Per Student Per Day" policy
                LocalDateTime startOfDay = time.toLocalDate().atStartOfDay();
                LocalDateTime endOfDay = time.toLocalDate().atTime(23, 59, 59);
                List<TrainerSession> existingOnDay = trainerSessionRepository.findMemberSessionsOnDay(member, startOfDay, endOfDay);
                if (!existingOnDay.isEmpty()) {
                    throw new RuntimeException("Access Denied: You already have a session logged for this date (" + time.toLocalDate() + "). Members are strictly permitted to book only one workout session per day to ensure physiological recovery.");
                }

                TrainerSession session = new TrainerSession();
                session.setTrainer(trainer);
                session.setMember(member);
                session.setSessionType(type);
                session.setVenue(venue);
                session.setSessionTime(time);
                session.setEndTime(time.plusHours(1)); // Default for manual sessions
                session.setStatus("UPCOMING");
                return new TrainerSessionDTO(trainerSessionRepository.save(session));
        }

        public void completeSession(Long sessionId, String status, String notes) {
                if (sessionId == null)
                        return;
                TrainerSession session = trainerSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new RuntimeException("Session not found"));
                
                if (session.getEndTime() != null && LocalDateTime.now().isBefore(session.getEndTime())) {
                    throw new RuntimeException("Protocol Violation: You cannot mark this session as completed until it has officially concluded at " + session.getEndTime().toLocalTime());
                }

                session.setStatus(status != null ? status : "COMPLETED");
                session.setNotes(notes);
                trainerSessionRepository.save(session);
        }

        public TrainerSlotDTO createSlot(String trainerUsername, LocalDateTime start, LocalDateTime end,
                        Integer capacity) {
                if (start.isBefore(LocalDateTime.now().plusHours(4))) {
                    throw new RuntimeException("Validation Error: Slots must be scheduled at least 4 hours in advance.");
                }

                // Gym Hours Validation: Active 5 AM to 1 AM | Closed 1 AM - 5 AM
                java.time.LocalTime startTime = start.toLocalTime();
                java.time.LocalTime endTime = end.toLocalTime();
                java.time.LocalTime closingLimit = java.time.LocalTime.of(1, 0);
                java.time.LocalTime openingTime = java.time.LocalTime.of(5, 0);

                // A time is invalid if it is AFTER 01:00 AM AND BEFORE 05:00 AM
                boolean isStartInvalid = startTime.isAfter(closingLimit) && startTime.isBefore(openingTime);
                boolean isEndInvalid = endTime.isAfter(closingLimit) && endTime.isBefore(openingTime);
                
                // Also check if the slot exactly starts/ends in the middle of the closed window
                // (Though isAfter/isBefore handles most cases)
                
                if (isStartInvalid || isEndInvalid) {
                    throw new RuntimeException("Operational Protocol: The facility is closed for maintenance between 01:00 AM and 05:00 AM. Please select a valid time.");
                }

                // Additional check: Does it span the entire closed window? (e.g. 12:50 AM to 5:10 AM)
                // This is caught by the 4-hour max limit (duration > 4h), but good to be explicit
                if (startTime.isBefore(openingTime) && startTime.isAfter(closingLimit.minusMinutes(1)) && endTime.isAfter(openingTime)) {
                     // This is mostly redundant due to duration checks but adds safety
                }

                if (java.time.Duration.between(start, end).toHours() < 1) {
                    throw new RuntimeException("Validation Error: Minimum slot duration is 1 hour.");
                }

                if (java.time.Duration.between(start, end).toHours() > 4) {
                    throw new RuntimeException("Validation Error: Maximum slot duration is 4 hours.");
                }

                if (capacity > 8) {
                    throw new RuntimeException("Validation Error: Maximum slot capacity is 8 members.");
                }

                // Gym Capacity Check: Max 5 trainers at the same time
                List<TrainerSlot> overlappingSlots = trainerSlotRepository.findOverlappingSlots(start, end);
                java.util.Set<Long> uniqueTrainerIds = overlappingSlots.stream()
                        .map(s -> s.getTrainer().getId())
                        .collect(Collectors.toSet());
                
                if (uniqueTrainerIds.size() >= 5) {
                    // Check if current trainer is already part of these slots
                    User currentTrainer = userRepository.findByUsername(trainerUsername)
                        .orElseThrow(() -> new RuntimeException("Trainer not found"));
                    if (!uniqueTrainerIds.contains(currentTrainer.getId())) {
                        throw new RuntimeException("Sorry, the " + start.toLocalTime() + " slot has reached its maximum capacity. Please select another time.");
                    }
                }

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

        public List<TrainerSlotDTO> getAllSlots() {
                return trainerSlotRepository.findAll().stream()
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
                        
                        // Update time if provided
                        if (newStart != null && newEnd != null) {
                            // Gym Hours Validation: Active 5 AM to 1 AM | Closed 1 AM - 5 AM
                            java.time.LocalTime startTime = newStart.toLocalTime();
                            java.time.LocalTime endTime = newEnd.toLocalTime();
                            java.time.LocalTime closingLimit = java.time.LocalTime.of(1, 0);
                            java.time.LocalTime openingTime = java.time.LocalTime.of(5, 0);

                            boolean isStartInvalid = startTime.isAfter(closingLimit) && startTime.isBefore(openingTime);
                            boolean isEndInvalid = endTime.isAfter(closingLimit) && endTime.isBefore(openingTime);
                            
                            if (isStartInvalid || isEndInvalid || (startTime.equals(closingLimit) && startTime.getNano() == 0)) {
                                throw new RuntimeException("Operational Protocol: The facility is closed for maintenance between 01:00 AM and 05:00 AM. Please select a valid time.");
                            }

                            slot.setStartTime(newStart);
                            slot.setEndTime(newEnd);
                        } else { // If only one of newStart or newEnd is provided, or neither, keep existing
                            if (newStart != null)
                                slot.setStartTime(newStart);
                            if (newEnd != null)
                                slot.setEndTime(newEnd);
                        }
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

        @Transactional
        public void bookSlot(String memberUsername, Long slotId) {
                User member = userRepository.findByUsername(memberUsername)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                TrainerSlot slot = trainerSlotRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                if (slot.getBookedCount() >= slot.getCapacity()) {
                        throw new RuntimeException("Slot is full");
                }

                // Protocol Check: Enforcement of "One Session Per Student Per Day" policy
                LocalDateTime sessionTime = slot.getStartTime();
                LocalDateTime startOfDay = sessionTime.toLocalDate().atStartOfDay();
                LocalDateTime endOfDay = sessionTime.toLocalDate().atTime(23, 59, 59);
                List<TrainerSession> existingOnDay = trainerSessionRepository.findMemberSessionsOnDay(member, startOfDay, endOfDay);
                if (!existingOnDay.isEmpty()) {
                    throw new RuntimeException("Operational Protocol: You already have a session confirmed for this date. The training policy restricts members to one session per day to ensure optimal student progression.");
                }

                // Associate the member with this trainer to ensure they appear in My Members lists
                // This builds a permanent relationship alongside the specific session
                member.setTrainer(slot.getTrainer());
                userRepository.save(member);

                TrainerSession session = new TrainerSession();
                session.setTrainer(slot.getTrainer());
                session.setMember(member);
                session.setSlot(slot);
                session.setSessionTime(slot.getStartTime());
                session.setEndTime(slot.getEndTime());
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

    @Transactional
    public void sendMessageToMember(String trainerUsername, Long memberId, String message) {
        if (message == null || message.trim().length() < 10) {
            throw new RuntimeException("Operational Protocol: Notification messages must be at least 10 characters long to provide substantive guidance.");
        }

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Athlete profile not found."));

        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new RuntimeException("Trainer record not found."));

        // Create the notification
        Notification notification = new Notification();
        notification.setTitle("Technical Insight: Message from " + trainer.getUsername());
        notification.setMessage(message);
        notification.setType("PROGRESS_ADVISORY");
        notification.setUser(member);
        notification.setRead(false);
        notificationRepository.save(notification);

        // Send Email Notification
        if (member.getEmail() != null && !member.getEmail().isEmpty()) {
            String emailBody = "Hello " + member.getUsername() + ",\n\n" +
                    "Your Lead Trainer, " + trainer.getUsername() + ", has dispatched a specific guidance message regarding your progression:\n\n" +
                    "--------------------------------------------------\n" +
                    message + "\n" +
                    "--------------------------------------------------\n\n" +
                    "Please log in to your MuscleHub Dashboard to respond or adjust your training protocol accordingly.\n\n" +
                    "Best regards,\nMuscleHub Operations";
            emailService.sendEmail(member.getEmail(), "MuscleHub Advisory: Message from " + trainer.getUsername(), emailBody);
        }
    }
}
/ /   R e f i n e d   s t a t u s   t r a c k i n g   l o g i c   f o r   m e m b e r   p r o g r e s s  
 