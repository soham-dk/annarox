package com.annarox.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.PaymentRequestDTO;
import com.annarox.dtos.ProcessRequestDTO;
import com.annarox.dtos.WithdrawBalanceDTO;
import com.annarox.enums.RequestStatus;
import com.annarox.security.SecurityUtil;
import com.annarox.service.PaymentRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payment-requests")
@RequiredArgsConstructor
public class PaymentRequestController {

    private final PaymentRequestService requestService;
    private final SecurityUtil securityUtil;

    @GetMapping("/pending")
    public ApiResponseDTO<List<PaymentRequestDTO>> getPending() {
        List<PaymentRequestDTO> pending = requestService.getPendingRequests();
        return ApiResponseDTO.ok(pending, "Pending requests fetched successfully", 200);
    }

    @PostMapping("/{id}/process")
    public ApiResponseDTO<PaymentRequestDTO> process(
            @PathVariable Long id,
            @RequestBody ProcessRequestDTO dto) {

        Long managerId = securityUtil.getCurrentUserId();

        PaymentRequestDTO response =
                requestService.processByManager(id, dto, managerId);

        String message = response.getStatus() == RequestStatus.APPROVED
                ? "Request approved"
                : "Request rejected";

        return ApiResponseDTO.ok(response, message, 200);
    }
    
    @PostMapping("/withdraw")
    public ApiResponseDTO<?> withdraw(@RequestBody WithdrawBalanceDTO dto) {

        Long userId = securityUtil.getCurrentUserId();

        requestService.createWithdrawRequest(userId, dto.getAmount());

        return ApiResponseDTO.ok(null, "Withdrawal request created", 200);
    }
}
