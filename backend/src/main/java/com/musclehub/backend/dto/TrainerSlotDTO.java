package com.musclehub.backend.dto;

import com.musclehub.backend.entity.TrainerSlot;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TrainerSlotDTO {
    private Long id;
    private Long trainerId;
    private String trainerUsername;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer bookedCount;
    private String status;

    public TrainerSlotDTO(TrainerSlot slot) {
        this.id = slot.getId();
        if (slot.getTrainer() != null) {
            this.trainerId = slot.getTrainer().getId();
            this.trainerUsername = slot.getTrainer().getUsername();
        }
        this.startTime = slot.getStartTime();
        this.endTime = slot.getEndTime();
        this.capacity = slot.getCapacity();
        this.bookedCount = slot.getBookedCount();
        this.status = slot.getStatus();
    }
}
