package com.annarox.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.annarox.dtos.RoundResponseDTO;
import com.annarox.entity.Bet;
import com.annarox.entity.Round;
import com.annarox.enums.RoundStatus;
import com.annarox.enums.TransactionReference;
import com.annarox.enums.TransactionStatus;
import com.annarox.enums.TransactionType;
import com.annarox.exception.BusinessException;
import com.annarox.exception.NotFoundException;
import com.annarox.repository.BetRepository;
import com.annarox.repository.RoundRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

	private final RoundRepository roundRepository;
	private final BetRepository betRepository;
	private final WalletService walletService;

	@Override
	@Transactional
	public RoundResponseDTO openRound(String name) {

		Round round = Round.builder().name(name).status(RoundStatus.OPEN).openedAt(LocalDateTime.now()).build();

		Round saved = roundRepository.save(round);

		return map(saved);
	}

	@Override
	@Transactional
	public void closeRound(Long roundId) {

		Round round = roundRepository.findById(roundId).orElseThrow(() -> new NotFoundException("Round not found"));

		if (round.getStatus() != RoundStatus.OPEN) {
			throw new BusinessException("Only OPEN round can be closed");
		}

		round.setStatus(RoundStatus.CLOSED);
	}

	@Override
	@Transactional
	public RoundResponseDTO drawRound(Long roundId, int winningNumber) {

		Round round = roundRepository.findById(roundId).orElseThrow(() -> new NotFoundException("Round not found"));

		if (round.getStatus() == RoundStatus.DRAWN) {
			throw new BusinessException("Round is already DRAWN");
		}
		
		if (round.getStatus() != RoundStatus.CLOSED) {
			throw new BusinessException("Round must be CLOSED first");
		}

		round.setWinningNumber(winningNumber);
		round.setStatus(RoundStatus.DRAWN);
		round.setDrawnAt(LocalDateTime.now());

		List<Bet> bets = betRepository.findByRoundId(roundId);

		for (Bet bet : bets) {
			if (bet.getNumber().equals(winningNumber)) {

				BigDecimal reward = bet.getTokens().multiply(BigDecimal.valueOf(2));

				walletService.processTransaction(bet.getUser(), reward, TransactionType.CREDIT,
						TransactionReference.BET_WIN, null,TransactionStatus.SUCCESS);
				bet.setWon(true);

			} else {
				bet.setWon(false);
			}
		}

		return mapForDrawnRound(round);
	}

	private RoundResponseDTO map(Round r) {
		return RoundResponseDTO.builder().id(r.getId()).name(r.getName()).status(r.getStatus().name())
				.build();
	}
	
	private RoundResponseDTO mapForDrawnRound(Round r) {
		return RoundResponseDTO.builder().id(r.getId()).name(r.getName()).status(r.getStatus().name())
				.winningNumber(r.getWinningNumber()).build();
	}

	@Override
	public RoundResponseDTO getCurrentRound() {
	    return roundRepository.findTopByOrderByCreatedAtDesc()
	            .map(this::mapToDTO)   // map runs ONLY if value is present
	            .orElse(null);         // safe fallback
	}

	private RoundResponseDTO mapToDTO(Round round) {
		return RoundResponseDTO.builder().id(round.getId()).name(round.getName()).status(round.getStatus().name())
				.winningNumber(round.getWinningNumber()).build();
	}
	
}