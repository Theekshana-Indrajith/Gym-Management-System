package com.musclehub.backend.repository;

import com.musclehub.backend.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
}
