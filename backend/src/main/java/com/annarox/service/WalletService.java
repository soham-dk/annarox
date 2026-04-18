package com.annarox.service;

import java.math.BigDecimal;
import java.util.List;

import com.annarox.dtos.AddBalanceDTO;
import com.annarox.dtos.WalletResponseDTO;
import com.annarox.entity.Transaction;
import com.annarox.entity.User;
import com.annarox.entity.Wallet;
import com.annarox.enums.TransactionReference;
import com.annarox.enums.TransactionStatus;
import com.annarox.enums.TransactionType;

public interface WalletService {
	Wallet createWallet(User user);

	WalletResponseDTO getWallet(Long userId);

	Transaction processTransaction(User user, BigDecimal amount, TransactionType type, TransactionReference reference,
			User performedBy, TransactionStatus status);
	void updateTransactionStatus(Long txnId, TransactionStatus status);
	
	Object addBalance(Long userId, AddBalanceDTO dto);

	WalletResponseDTO withdraw(Long userId, BigDecimal amount);

	void rejectWithdrawal(Long id);

	void approveWithdrawal(Long id);

	Object getPendingWithdrawals();
}