package com.musclehub.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.musclehub.backend.entity.TrainerSession;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TrainerSessionDTO {
    private Long id;
    private UserSummary trainer;
    private UserSummary member;
    private String sessionType;
    private String venue;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sessionTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    private String notes;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserSummary {
        private String username;
    }

    public TrainerSessionDTO(TrainerSession session) {
        this.id = session.getId();
        this.trainer = (session.getTrainer() != null) ? new UserSummary(session.getTrainer().getUsername()) : null;
        this.member = (session.getMember() != null) ? new UserSummary(session.getMember().getUsername()) : null;
        this.sessionType = session.getSessionType();
        this.venue = session.getVenue();
        this.status = session.getStatus();
        this.sessionTime = session.getSessionTime();
        this.endTime = session.getEndTime();
        this.notes = session.getNotes();
    }
}
