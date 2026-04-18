package com.annarox.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.annarox.dtos.ApiResponseDTO;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class AuthExceptionHandler {

	@ExceptionHandler(UserDoesNotExist.class)
	public ResponseEntity<ApiResponseDTO<Void>> handleUserDoesNotExists(UserDoesNotExist ex,
			HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiResponseDTO.error(request.getRequestURI(), ex.getMessage(), HttpStatus.NOT_FOUND.value()));
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ApiResponseDTO<Void>> handleInvalidCredentials(InvalidCredentialsException ex,
			HttpServletRequest request) {

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(ApiResponseDTO.error(request.getRequestURI(), ex.getMessage(), HttpStatus.UNAUTHORIZED.value()));
	}

}
