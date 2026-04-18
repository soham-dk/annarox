package com.annarox.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.annarox.enums.RequestStatus;
import com.annarox.enums.RequestType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequestDTO {
	private Long id;
	private Long userId;
	private String phoneNumber;
	private BigDecimal amount;
	private RequestType type;
	private RequestStatus status;
	private String adminNote;
	private LocalDateTime createdAt;
	private Long transactionId;

}
