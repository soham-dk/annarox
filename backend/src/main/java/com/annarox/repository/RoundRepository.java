package com.annarox.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.annarox.entity.Round;
import com.annarox.enums.RoundStatus;

public interface RoundRepository extends JpaRepository<Round, Long> {
    Optional<Round> findByStatus(RoundStatus status);
    Optional<Round> findTopByOrderByCreatedAtDesc();
}