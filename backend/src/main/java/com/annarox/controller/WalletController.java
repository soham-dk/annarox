package com.annarox.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.AddBalanceDTO;
import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.WithdrawBalanceDTO;
import com.annarox.enums.Role;
import com.annarox.security.SecurityUtil;
import com.annarox.service.WalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

	private final WalletService walletService;
	private final SecurityUtil securityUtil;

	@GetMapping
	public ApiResponseDTO<?> getWallet() {
		Long userId = securityUtil.getCurrentUserId();
		return ApiResponseDTO.ok(walletService.getWallet(userId), "Wallet fetched successfully", 200);
	}

	@PreAuthorize("hasRole('MANAGER')")
	@PostMapping("/add")
	public ApiResponseDTO<?> addBalance(@RequestBody AddBalanceDTO dto) {

		Long managerId = securityUtil.getCurrentUserId();

		return ApiResponseDTO.ok(walletService.addBalance(managerId, dto), "Balance added successfully", 200);
	}

	@PostMapping("/withdraw")
	public ApiResponseDTO<?> withdraw(@RequestBody WithdrawBalanceDTO dto) {

		Long userId = securityUtil.getCurrentUserId();

		return ApiResponseDTO.ok(walletService.withdraw(userId, dto.getAmount()), "Withdraw successful", 200);
	}

	@PreAuthorize("hasRole('MANAGER')")
	@GetMapping("/withdrawals/pending")
	public ApiResponseDTO<?> getPending() {
		return ApiResponseDTO.ok(walletService.getPendingWithdrawals(), "Pending requests fetched", 200);
	}

	// 2. Mark as paid
	@PostMapping("/withdrawals/{id}/approve")
	@PreAuthorize("hasRole('MANAGER')")
	public ApiResponseDTO<?> approve(@PathVariable Long id) {
		walletService.approveWithdrawal(id);
		return ApiResponseDTO.ok(null, "Withdrawal marked as SUCCESS", 200);
	}

	// 3. Optional: Reject and refund
	@PostMapping("/withdrawals/{id}/reject")
	@PreAuthorize("hasRole('MANAGER')")
	public ApiResponseDTO<?> reject(@PathVariable Long id) {
		walletService.rejectWithdrawal(id);
		return ApiResponseDTO.ok(null, "Withdrawal REJECTED and funds returned", 200);
	}
}
