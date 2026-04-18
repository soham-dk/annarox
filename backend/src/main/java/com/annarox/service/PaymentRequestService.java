package com.annarox.service;

import java.math.BigDecimal;
import java.util.List;

import com.annarox.dtos.PaymentRequestDTO;
import com.annarox.dtos.ProcessRequestDTO;

public interface PaymentRequestService {

	List<PaymentRequestDTO> getPendingRequests();

	PaymentRequestDTO processByManager(Long id, ProcessRequestDTO dto, Long userId);
	
	void createWithdrawRequest(Long userId, BigDecimal amount);

}
