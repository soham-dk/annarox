package com.annarox.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.annarox.dtos.AddBalanceDTO;
import com.annarox.dtos.WalletResponseDTO;
import com.annarox.entity.Transaction;
import com.annarox.entity.User;
import com.annarox.entity.Wallet;
import com.annarox.enums.TransactionReference;
import com.annarox.enums.TransactionStatus;
import com.annarox.enums.TransactionType;
import com.annarox.exception.BusinessException;
import com.annarox.exception.NotFoundException;
import com.annarox.exception.UserAuthenticationException;
import com.annarox.repository.TransactionRepository;
import com.annarox.repository.UserRepository;
import com.annarox.repository.WalletRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

	private final WalletRepository walletRepository;
	private final TransactionRepository txnRepo;
	private final UserRepository userRepository;

	@Override
	@Transactional
	public Wallet createWallet(User user) {

		if (walletRepository.existsByUser(user)) {
			throw new BusinessException("Wallet already exists");
		}

		Wallet wallet = new Wallet();
		wallet.setUser(user);
		wallet.setBalance(BigDecimal.ZERO);

		return walletRepository.save(wallet);
	}

	@Transactional
	public Transaction processTransaction(User user, BigDecimal amount, TransactionType type, TransactionReference reference,
			User performedBy, TransactionStatus status) {

		if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException("Invalid amount");
		}
		
		if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException("Insufficient balance");
		}

		Wallet wallet = walletRepository.findByUserForUpdate(user)
				.orElseThrow(() -> new NotFoundException("Wallet not found"));

		// Apply logic
		if (type == TransactionType.DEBIT) {
			if (wallet.getBalance().compareTo(amount) < 0) {
				throw new BusinessException("Insufficient balance");
			}
			wallet.setBalance(wallet.getBalance().subtract(amount));
		} else {
			wallet.setBalance(wallet.getBalance().add(amount));
		}

		walletRepository.save(wallet);

		// Ledger entry (source of truth)
		Transaction txn = Transaction.builder().user(user).performedBy(performedBy).amount(amount).type(type)
				.reference(reference).status(status).build();

		return txnRepo.save(txn);
	}

	@Override
	@Transactional
	public WalletResponseDTO getWallet(Long userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

		Wallet wallet = walletRepository.findByUser(user).orElseThrow(() -> new NotFoundException("Wallet not found"));

		return WalletResponseDTO.builder().userId(user.getId()).balance(wallet.getBalance()).build();
	}

	@Override
	@Transactional
	public WalletResponseDTO addBalance(Long managerId, AddBalanceDTO dto) {

		if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException("Invalid amount");
		}

		User manager = userRepository.findById(managerId).orElseThrow(() -> new NotFoundException("Manager not found"));

		if (!manager.getRole().name().equals("MANAGER")) {
			throw new UserAuthenticationException("Only manager can add balance");
		}

		// Fetch target user
		User user = userRepository.findById(dto.getUserId()).orElseThrow(() -> new NotFoundException("User not found"));

		// Credit user's wallet
		processTransaction(user, dto.getAmount(), TransactionType.CREDIT, TransactionReference.MANAGER_ADD, manager,
				TransactionStatus.SUCCESS);

		Wallet wallet = walletRepository.findByUser(user).orElseThrow(() -> new NotFoundException("Wallet not found"));

		return mapToDTO(wallet);
	}

	@Override
	@Transactional
	public WalletResponseDTO withdraw(Long userId, BigDecimal amount) {

		if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException("Invalid amount");
		}

		User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

		processTransaction(user, amount, TransactionType.DEBIT, TransactionReference.WITHDRAWAL, user,
				TransactionStatus.PENDING);

		Wallet wallet = walletRepository.findByUser(user).orElseThrow(() -> new NotFoundException("Wallet not found"));

		return mapToDTO(wallet);
	}

	private WalletResponseDTO mapToDTO(Wallet wallet) {
		return WalletResponseDTO.builder().userId(wallet.getUser().getId()).balance(wallet.getBalance()).build();
	}

	public List<Transaction> getPendingWithdrawals() {
		return txnRepo.findByStatus(TransactionStatus.PENDING);
	}

	@Transactional
	public void approveWithdrawal(Long transactionId) {
		Transaction tx = txnRepo.findById(transactionId)
				.orElseThrow(() -> new NotFoundException("Transaction not found"));

		if (!tx.getStatus().equals(TransactionStatus.PENDING)) {
			throw new BusinessException("Transaction already processed");
		}

		tx.setStatus(TransactionStatus.SUCCESS);
		txnRepo.save(tx);
	}

	@Transactional
	public void rejectWithdrawal(Long transactionId) {
		Transaction tx = txnRepo.findById(transactionId)
				.orElseThrow(() -> new NotFoundException("Transaction not found"));

		if (!tx.getStatus().equals(TransactionStatus.PENDING)) {
			throw new BusinessException("Transaction already processed");
		}

		// Refund the money to the user's wallet
		Wallet wallet = walletRepository.findByUser(tx.getUser())
				.orElseThrow(() -> new NotFoundException("Wallet not found"));

		wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
		walletRepository.save(wallet);

		tx.setStatus(TransactionStatus.REJECTED);
		txnRepo.save(tx);
	}
	
	@Transactional
	public void updateTransactionStatus(Long txnId, TransactionStatus status) {
	    Transaction txn = txnRepo.findById(txnId)
	            .orElseThrow(() -> new RuntimeException("Transaction not found"));

	    txn.setStatus(status);
	    txnRepo.save(txn);
	}
}
