package com.musclehub.backend.service;

import com.musclehub.backend.dto.AuthResponse;
import com.musclehub.backend.dto.LoginRequest;
import com.musclehub.backend.dto.RegisterRequest;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        // Force role to MEMBER for public registration
        user.setRole(User.Role.MEMBER);

        userRepository.save(user);

        return new AuthResponse("User registered successfully", user.getUsername(), user.getRole(), user.getId());
    }

    public AuthResponse createTrainer(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.TRAINER);

        userRepository.save(user);

        return new AuthResponse("Trainer created successfully", user.getUsername(), user.getRole(), user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse("Login successful", user.getUsername(), user.getRole(), user.getId());
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send actual email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("cinemascopehelp@gmail.com");
        message.setTo(email);
        message.setSubject("MuscleHub - Password Reset Token");
        message.setText("Hello,\n\nYour password reset token is: " + token + 
                        "\n\nPlease use this token in the MuscleHub application to reset your password.\n" +
                        "This token will expire in 1 hour.\n\nBest regards,\nMuscleHub Team");
        
        mailSender.send(message);

        System.out.println(">>> Password reset token sent to " + email);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }
}
