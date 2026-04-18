package com.musclehub.backend.service;

import com.musclehub.backend.dto.AuthResponse;
import com.musclehub.backend.dto.LoginRequest;
import com.musclehub.backend.dto.RegisterRequest;
import com.musclehub.backend.entity.EmailVerification;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.EmailVerificationRepository;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    public void sendVerificationOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered!");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        EmailVerification verification = new EmailVerification();
        verification.setEmail(email);
        verification.setOtp(otp);
        verification.setExpiryTime(LocalDateTime.now().plusMinutes(10)); // valid for 10 mins
        verificationRepository.save(verification);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("musclehubhelp@gmail.com");
        message.setTo(email);
        message.setSubject("MuscleHub - Registration Verification");
        message.setText("Welcome to MuscleHub!\n\nYour verification code is: " + otp + 
                        "\n\nPlease use this code to complete your registration. This code will expire in 10 minutes.\n\nBest regards,\nMuscleHub Team");
        mailSender.send(message);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        EmailVerification verification = verificationRepository.findById(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No verification code found for this email."));

        if (!verification.getOtp().equals(request.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code!");
        }

        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired. Please request a new one.");
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
        user.setRole(User.Role.MEMBER);

        userRepository.save(user);
        
        // Clean up verification
        verificationRepository.delete(verification);

        return new AuthResponse("User registered successfully", user.getUsername(), user.getRole(), user.getId());
    }

    public AuthResponse createTrainer(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("musclehubhelp@gmail.com");
        message.setTo(email);
        message.setSubject("MuscleHub - Password Reset Token");
        message.setText("Hello,\n\nYour password reset token is: " + token + 
                        "\n\nPlease use this token in the MuscleHub application to reset your password.\n" +
                        "This token will expire in 1 hour.\n\nBest regards,\nMuscleHub Team");
        
        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }
}
