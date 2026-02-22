package com.musclehub.backend.dto;

import com.musclehub.backend.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private User.Role role;
}
