package com.annarox.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.annarox.enums.RequestStatus;
import com.annarox.enums.RequestType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private BigDecimal amount;
    
    private Long transactionId;
    
    @Enumerated(EnumType.STRING)
    private RequestType type; // DEPOSIT or WITHDRAWAL
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, APPROVED, REJECTED
    
    @ManyToOne
    private User user;
    
    private String adminNote; // To store UTR number or rejection reason
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime processedAt;
}
