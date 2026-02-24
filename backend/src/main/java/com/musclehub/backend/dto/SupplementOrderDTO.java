package com.musclehub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplementOrderDTO {
    private Long id;
    private String username;
    private String userEmail;
    private String supplementName;
    private String category;
    private Integer quantity;
    private Double totalPrice;
    private LocalDateTime orderDate;
}
