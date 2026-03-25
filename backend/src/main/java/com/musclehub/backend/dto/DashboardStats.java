package com.musclehub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalAdmins;
    private long totalTrainers;
    private long totalMembers;
}
