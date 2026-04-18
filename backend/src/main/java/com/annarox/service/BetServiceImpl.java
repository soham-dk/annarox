package com.annarox.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.annarox.dtos.BetResponseDTO;
import com.annarox.dtos.NumberStatDTO;
import com.annarox.dtos.PlaceBetRequestDTO;
import com.annarox.dtos.RoundStatsResponseDTO;
import com.annarox.entity.Bet;
import com.annarox.entity.Round;
import com.annarox.entity.User;
import com.annarox.enums.RoundStatus;
import com.annarox.enums.TransactionReference;
import com.annarox.enums.TransactionStatus;
import com.annarox.enums.TransactionType;
import com.annarox.exception.BusinessException;
import com.annarox.exception.NotFoundException;
import com.annarox.repository.BetRepository;
import com.annarox.repository.RoundRepository;
import com.annarox.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BetServiceImpl implements BetService {

	private final BetRepository betRepository;
	private final RoundRepository roundRepository;
	private final UserRepository userRepository;
	private final WalletService walletService;

	@Override
	@Transactional
	public BetResponseDTO placeBet(Long userId, PlaceBetRequestDTO dto) {

		if (dto.getNumber() < 0 || dto.getNumber() > 9) {
			throw new BusinessException("Number must be between 0-9");
		}

		Round round = roundRepository.findByStatus(RoundStatus.OPEN)
				.orElseThrow(() -> new BusinessException("No open round found"));

		User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

		// Debit wallet first
		walletService.processTransaction(user, dto.getTokens(), TransactionType.DEBIT, TransactionReference.BET_PLACED,
				user, TransactionStatus.SUCCESS);

		Bet bet = Bet.builder().round(round).user(user).number(dto.getNumber()).tokens(dto.getTokens())
				.placedAt(LocalDateTime.now()).build();

		Bet saved = betRepository.save(bet);

		return BetResponseDTO.builder().betId(saved.getId()).roundId(round.getId()).number(saved.getNumber())
				.tokens(saved.getTokens()).won(saved.getWon()).build();
	}

	@Override
	public RoundStatsResponseDTO getBetStats(Long roundId) {

		// Validate round exists
		if (!roundRepository.existsById(roundId)) {
			throw new NotFoundException("Round not found with id: " + roundId);
		}

		List<Object[]> results = betRepository.getBetStatsByRound(roundId);

		List<NumberStatDTO> stats = new ArrayList<>();

		long total = 0;

		for (Object[] row : results) {
			Integer number = (Integer) row[0];
			Long count = (Long) row[1];
			BigDecimal totalAmount = (BigDecimal) row[2];

			stats.add(new NumberStatDTO(number, count, totalAmount));
			total += count;
		}

		return RoundStatsResponseDTO.builder().roundId(roundId).totalBets(total).numberStats(stats).build();
	}
}
