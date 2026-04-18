package com.annarox.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.annarox.entity.User;
import com.annarox.entity.Wallet;

import jakarta.persistence.LockModeType;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
	boolean existsByUser(User user);

	Optional<Wallet> findByUser(User user);

	Optional<Wallet> findByUserId(Long userId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT w FROM Wallet w WHERE w.user = :user")
	Optional<Wallet> findByUserForUpdate(User user);
}