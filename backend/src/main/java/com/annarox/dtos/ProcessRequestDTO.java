package com.annarox.dtos;

import com.annarox.enums.RequestStatus;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProcessRequestDTO {
	private RequestStatus status; // APPROVED or REJECTED
	private String adminNote;
}
