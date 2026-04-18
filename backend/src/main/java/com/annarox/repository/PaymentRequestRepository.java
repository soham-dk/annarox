package com.annarox.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.annarox.entity.PaymentRequest;
import com.annarox.entity.User;
import com.annarox.enums.RequestStatus;

public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {
    List<PaymentRequest> findByStatus(RequestStatus status);
    List<PaymentRequest> findByUserOrderByCreatedAtDesc(User user);
}
