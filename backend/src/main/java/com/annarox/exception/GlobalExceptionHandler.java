package com.annarox.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.annarox.dtos.ApiResponseDTO;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResponseDTO<?>> handleBusiness(BusinessException ex) {
		return ResponseEntity.badRequest().body(ApiResponseDTO.ok(null, ex.getMessage(), 400));
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ApiResponseDTO<?>> handleNotFound(NotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponseDTO.ok(null, ex.getMessage(), 404));
	}

	@ExceptionHandler(UserAuthenticationException.class)
	public ResponseEntity<ApiResponseDTO<?>> handleUserAuthenticationException(UserAuthenticationException ex,
			HttpServletRequest request) {

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponseDTO.error(request.getRequestURI(), ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponseDTO<?>> handleGenericException(Exception ex, HttpServletRequest request) {

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseDTO
				.error(request.getRequestURI(), "Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR.value()));
	}

	@ExceptionHandler(UserAlreadyExistsException.class)
	public ResponseEntity<ApiResponseDTO<Void>> handleUserExists(UserAlreadyExistsException ex,
			HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiResponseDTO.error(request.getRequestURI(), ex.getMessage(), HttpStatus.CONFLICT.value()));
	}
}