package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "membership_requests")
public class MembershipRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private MembershipPackage membershipPackage;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private LocalDateTime requestDate = LocalDateTime.now();
    private LocalDateTime processedDate;

    private String paymentReference; // Simulated payment ID
    private String paymentSlipUrl;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
