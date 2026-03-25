package com.musclehub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "supplement_orders")
public class SupplementOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime orderDate = LocalDateTime.now();
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DeliveryMethod deliveryMethod;

    private String deliveryAddress;
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PaymentMethod paymentMethod;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String paymentSlip; // Base64 or URL to the uploaded slip image
    
    // To handle legacy DB column or accidental addition
    @Column(name = "supplement_id", nullable = true)
    private Long supplementId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<SupplementOrderItem> items = new java.util.ArrayList<>();

    public enum DeliveryMethod {
        COURIER, PICKUP
    }

    public enum PaymentMethod {
        ONLINE_PAYMENT, CASH_ON_PICKUP, WALLET
    }

    public enum OrderStatus {
        PENDING, 
        AWAITING_PAYMENT_APPROVAL,
        PAYMENT_VERIFIED,
        PREPARED,
        SHIPPED,
        COMPLETED,
        CANCELLED
    }
}
