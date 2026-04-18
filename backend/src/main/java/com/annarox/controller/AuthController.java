package com.annarox.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.AuthResponseDTO;
import com.annarox.dtos.ForgotPasswordDTO;
import com.annarox.dtos.ResetPasswordDTO;
import com.annarox.dtos.UserLoginDTO;
import com.annarox.service.AuthService;
import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.UserResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(value = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponseDTO<?> login(@Valid @RequestBody UserLoginDTO loginDTO) {
        System.err.println("LOGGED IN USER" + loginDTO.toString());
        AuthResponseDTO user = authService.login(loginDTO);
        return ApiResponseDTO.ok(user, "User logged in successfully!", HttpStatus.ACCEPTED.value());
    }
    
    @PostMapping("/forgot-password")
    public ApiResponseDTO<?> forgotPassword(@RequestBody ForgotPasswordDTO dto) {

        authService.forgotPassword(dto.getPhoneNumber());

        return ApiResponseDTO.ok(
                null,
                "User verified",
                200);
    }

    @PostMapping("/reset-password")
    public ApiResponseDTO<?> resetPassword(@RequestBody ResetPasswordDTO dto) {

        authService.resetPassword(
                dto.getPhoneNumber(),
                dto.getNewPassword()
        );

        return ApiResponseDTO.ok(
                null,
                "Password reset successful",
                200);
    }
    
}
