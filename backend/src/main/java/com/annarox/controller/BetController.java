package com.annarox.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.PlaceBetRequestDTO;
import com.annarox.dtos.RoundStatsResponseDTO;
import com.annarox.security.SecurityUtil;
import com.annarox.service.BetService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bets")
@RequiredArgsConstructor
public class BetController {

	private final BetService betService;
	private final SecurityUtil securityUtil;

	@PostMapping
	public ApiResponseDTO<?> placeBet(@RequestBody PlaceBetRequestDTO dto) {
		Long userId = securityUtil.getCurrentUserId();

		return ApiResponseDTO.ok(betService.placeBet(userId, dto), "Bet placed successfully",
				HttpStatus.CREATED.value());
	}

	@GetMapping("/stats/{roundId}")
	public ApiResponseDTO<RoundStatsResponseDTO> getStats(@PathVariable Long roundId) {
	    return ApiResponseDTO.ok(
	            betService.getBetStats(roundId),
	            "Bet stats fetched successfully",
	            HttpStatus.OK.value()
	    );
	}
}