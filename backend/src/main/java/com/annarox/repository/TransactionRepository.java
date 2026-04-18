package com.annarox.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.annarox.entity.Transaction;
import com.annarox.enums.TransactionStatus;

public interface TransactionRepository extends JpaRepository<Transaction, Long>{

	List<Transaction> findByStatus(TransactionStatus status);
}
