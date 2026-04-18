package com.annarox.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.annarox.dtos.PaymentRequestDTO;
import com.annarox.dtos.ProcessRequestDTO;
import com.annarox.entity.PaymentRequest;
import com.annarox.entity.Transaction;
import com.annarox.entity.User;
import com.annarox.enums.RequestStatus;
import com.annarox.enums.RequestType;
import com.annarox.enums.TransactionReference;
import com.annarox.enums.TransactionStatus;
import com.annarox.enums.TransactionType;
import com.annarox.exception.BusinessException;
import com.annarox.exception.NotFoundException;
import com.annarox.exception.UserDoesNotExist;
import com.annarox.repository.PaymentRequestRepository;
import com.annarox.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentRequestServiceImpl implements PaymentRequestService {

    private final PaymentRequestRepository requestRepository;
    private final WalletService walletService;
    private final UserRepository userRepository;

    // ---------------- USER ACTIONS ----------------

    @Transactional
    public void createWithdrawRequest(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserDoesNotExist("User not found"));

        // 🔴 Critical safety check
        if (user.getWallet().getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient balance");
        }

        // 1. Lock money (create PENDING debit txn)
        Transaction txn = walletService.processTransaction(
                user,
                amount,
                TransactionType.DEBIT,
                TransactionReference.WITHDRAWAL,
                user,
                TransactionStatus.PENDING
        );

        // 2. Create request
        PaymentRequest request = new PaymentRequest();
        request.setUser(user);
        request.setAmount(amount);
        request.setType(RequestType.WITHDRAWAL);
        request.setStatus(RequestStatus.PENDING);
        request.setTransactionId(txn.getId());

        requestRepository.save(request);
    }

    @Transactional
    public void createDepositRequest(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserDoesNotExist("User not found"));

        PaymentRequest request = new PaymentRequest();
        request.setUser(user);
        request.setAmount(amount);
        request.setType(RequestType.DEPOSIT);
        request.setStatus(RequestStatus.PENDING);

        requestRepository.save(request);
    }

    // ---------------- ADMIN ACTIONS ----------------

    @Override
    @Transactional
    public PaymentRequestDTO processByManager(Long requestId, ProcessRequestDTO dto, Long userId) {

        User manager = userRepository.findById(userId)
                .orElseThrow(() -> new UserDoesNotExist("Manager not found"));

        PaymentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Payment request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BusinessException("Request already processed");
        }

        // -------- APPROVAL --------
        if (dto.getStatus() == RequestStatus.APPROVED) {

            if (request.getType() == RequestType.DEPOSIT) {

                walletService.processTransaction(
                        request.getUser(),
                        request.getAmount(),
                        TransactionType.CREDIT,
                        TransactionReference.MANAGER_ADD,
                        manager,
                        TransactionStatus.SUCCESS
                );

            } else { // WITHDRAWAL

                if (request.getTransactionId() == null) {
                    throw new BusinessException("Transaction not linked");
                }

                walletService.updateTransactionStatus(
                        request.getTransactionId(),
                        TransactionStatus.SUCCESS
                );
            }

            request.setStatus(RequestStatus.APPROVED);
        }

        // -------- REJECTION --------
        else {

            if (request.getType() == RequestType.WITHDRAWAL) {

                if (request.getTransactionId() == null) {
                    throw new BusinessException("Transaction not linked");
                }

                // 1. Mark original txn REJECTED
                walletService.updateTransactionStatus(
                        request.getTransactionId(),
                        TransactionStatus.REJECTED
                );

                // 2. Refund (correct reference)
                walletService.processTransaction(
                        request.getUser(),
                        request.getAmount(),
                        TransactionType.CREDIT,
                        TransactionReference.REFUND,
                        manager,
                        TransactionStatus.SUCCESS
                );
            }

            request.setStatus(RequestStatus.REJECTED);
        }

        request.setAdminNote(dto.getAdminNote());
        request.setProcessedAt(LocalDateTime.now());

        return mapToDTO(requestRepository.save(request));
    }

    // ---------------- FETCH ----------------

    @Override
    public List<PaymentRequestDTO> getPendingRequests() {
        return requestRepository.findByStatus(RequestStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
    // ---------------- MAPPER ----------------

    private PaymentRequestDTO mapToDTO(PaymentRequest request) {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setPhoneNumber(request.getUser().getPhoneNumber());
        dto.setAmount(request.getAmount());
        dto.setType(request.getType());
        dto.setStatus(request.getStatus());
        dto.setAdminNote(request.getAdminNote());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setTransactionId(request.getTransactionId());
        return dto;
    }
}