package com.musclehub.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "email_verifications")
public class EmailVerification {
    
    @Id
    private String email;
    
    private String otp;
    
    private LocalDateTime expiryTime;
}
