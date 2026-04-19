package com.annarox.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.CreateRoundDTO;
import com.annarox.dtos.DrawRoundDTO;
import com.annarox.dtos.RoundResponseDTO;
import com.annarox.service.RoundService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rounds")
@RequiredArgsConstructor
public class RoundController {

	private final RoundService roundService;

	@PostMapping("/open")
	public ApiResponseDTO<?> open(@RequestBody CreateRoundDTO dto) {
		return ApiResponseDTO.ok(roundService.openRound(dto.getName()), "Round opened", HttpStatus.CREATED.value());
	}

	@PostMapping("/{id}/close")
	public ApiResponseDTO<?> close(@PathVariable Long id) {
		System.out.println("User Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());

		roundService.closeRound(id);
		return ApiResponseDTO.ok(null, "Round closed", 200);
	}

	@PostMapping("/{id}/draw")
	public ApiResponseDTO<?> draw(@PathVariable Long id, @RequestBody DrawRoundDTO dto) {

		return ApiResponseDTO.ok(roundService.drawRound(id, dto.getWinningNumber()), "Round drawn successfully", 200);
	}

	@GetMapping("/current")
	public ApiResponseDTO<?> getCurrentRound() {
	    RoundResponseDTO round = roundService.getCurrentRound();

	    if (round == null) {
	        return ApiResponseDTO.ok(null, "No round found", 200);
	    }

	    return ApiResponseDTO.ok(round, "Latest round fetched", 200);
	}

}