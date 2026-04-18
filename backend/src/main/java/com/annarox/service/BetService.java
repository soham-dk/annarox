package com.annarox.service;

import com.annarox.dtos.BetResponseDTO;
import com.annarox.dtos.PlaceBetRequestDTO;
import com.annarox.dtos.RoundStatsResponseDTO;

public interface BetService {
	BetResponseDTO placeBet(Long userId, PlaceBetRequestDTO dto);
	RoundStatsResponseDTO getBetStats(Long roundId);
}