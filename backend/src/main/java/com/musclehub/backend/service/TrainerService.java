package com.musclehub.backend.service;

import com.musclehub.backend.dto.UserDTO;
import com.musclehub.backend.dto.InquiryDTO;
import com.musclehub.backend.dto.TrainerSessionDTO;
import com.musclehub.backend.dto.TrainerSlotDTO;
import com.musclehub.backend.entity.*;
import com.musclehub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainerService {

        private final UserRepository userRepository;
        private final AttendanceRepository attendanceRepository;
        private final EquipmentRepository equipmentRepository;
        private final InquiryRepository inquiryRepository;
        private final TrainerSessionRepository trainerSessionRepository;
        private final TrainerSlotRepository trainerSlotRepository;
        private final WorkoutPlanRepository workoutPlanRepository;
        private final MealPlanRepository mealPlanRepository;

        public List<UserDTO> getMyMembers(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                // Fetch unique members who have booked sessions with this trainer
                return trainerSessionRepository.findAllByTrainer(trainer).stream()
                                .map(TrainerSession::getMember)
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .map(UserDTO::new)
                                .collect(java.util.stream.Collectors.toList());
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

        public void updateEquipmentStatus(Long equipmentId, String status) {
                if (equipmentId == null)
                        return;
                Equipment equipment = equipmentRepository.findById(equipmentId)
                                .orElseThrow(() -> new RuntimeException("Equipment not found"));
                equipment.setStatus(Equipment.Status.valueOf(status.toUpperCase()));
                equipmentRepository.save(equipment);
        }

        public void assignWorkoutPlan(String trainerUsername, Long memberId, String planName, String exercises,
                        String difficulty, String goal) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                WorkoutPlan plan = new WorkoutPlan();
                plan.setTrainer(trainer);
                plan.setMember(member);
                plan.setPlanName(planName);
                plan.setExercises(exercises);
                plan.setDifficulty(difficulty);
                plan.setGoal(goal);
                workoutPlanRepository.save(plan);
        }

        public void assignMealPlan(String trainerUsername, Long memberId, String planName, String breakfast,
                        String lunch, String dinner, String snacks, Double calories, String dietType,
                        String supplements) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                User member = userRepository.findById(memberId)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                MealPlan plan = new MealPlan();
                plan.setTrainer(trainer);
                plan.setMember(member);
                plan.setPlanName(planName);
                plan.setBreakfast(breakfast);
                plan.setLunch(lunch);
                plan.setDinner(dinner);
                plan.setSnacks(snacks);
                plan.setDailyCalories(calories);
                plan.setDietType(dietType);
                plan.setRecommendedSupplements(supplements);
                mealPlanRepository.save(plan);
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
                                .collect(java.util.stream.Collectors.toList());
        }

        public List<TrainerSessionDTO> getMySessions(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return trainerSessionRepository.findAllByTrainer(trainer).stream()
                                .map(TrainerSessionDTO::new)
                                .collect(java.util.stream.Collectors.toList());
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

        public void completeSession(Long sessionId) {
                TrainerSession session = trainerSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new RuntimeException("Session not found"));
                session.setStatus("COMPLETED");
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
                slot.setCapacity(capacity);
                slot.setBookedCount(0);
                slot.setStatus("AVAILABLE");
                return new TrainerSlotDTO(trainerSlotRepository.save(slot));
        }

        public List<TrainerSlotDTO> getMySlots(String trainerUsername) {
                User trainer = userRepository.findByUsername(trainerUsername)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return trainerSlotRepository.findByTrainerId(trainer.getId()).stream()
                                .map(TrainerSlotDTO::new)
                                .collect(java.util.stream.Collectors.toList());
        }

        // Public method for members to book
        public void bookSlot(String memberUsername, Long slotId) {
                User member = userRepository.findByUsername(memberUsername)
                                .orElseThrow(() -> new RuntimeException("Member not found"));

                TrainerSlot slot = trainerSlotRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                if (slot.getBookedCount() >= slot.getCapacity()) {
                        throw new RuntimeException("Slot is full");
                }

                // Create session/booking
                TrainerSession session = new TrainerSession();
                session.setTrainer(slot.getTrainer());
                session.setMember(member);
                session.setSlot(slot);
                session.setSessionTime(slot.getStartTime());
                session.setSessionType("Standard Session");
                session.setVenue("Gym Floor");
                session.setStatus("UPCOMING");

                trainerSessionRepository.save(session);

                // Update slot
                slot.setBookedCount(slot.getBookedCount() + 1);
                if (slot.getBookedCount() >= slot.getCapacity()) {
                        slot.setStatus("FULL");
                }
                trainerSlotRepository.save(slot);
        }
}
