package com.annarox.service;

import java.util.Optional;

import com.annarox.dtos.RoundResponseDTO;
import com.annarox.entity.Round;

public interface RoundService {
	RoundResponseDTO openRound(String name);
    void closeRound(Long roundId);
    RoundResponseDTO drawRound(Long roundId, int winningNumber);
	RoundResponseDTO getCurrentRound();
    
}