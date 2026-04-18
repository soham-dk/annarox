package com.annarox.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.annarox.entity.Bet;

public interface BetRepository extends JpaRepository<Bet, Long> {

	List<Bet> findByRoundId(Long roundId);

	@Query("""
		    SELECT b.number, COUNT(b), SUM(b.tokens)
		    FROM Bet b
		    WHERE b.round.id = :roundId
		    GROUP BY b.number
		""")
		List<Object[]> getBetStatsByRound(Long roundId);
}