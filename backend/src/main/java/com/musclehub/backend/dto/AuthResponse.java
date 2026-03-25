package com.musclehub.backend.dto;

import com.musclehub.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String message;
    private String username;
    private User.Role role;
    private Long id;
}
