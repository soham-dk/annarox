package com.annarox.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annarox.dtos.ApiResponseDTO;
import com.annarox.dtos.UpdateUserStatusDTO;
import com.annarox.dtos.UserRegistrationDTO;
import com.annarox.dtos.UserResponseDTO;
import com.annarox.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(value = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResponseDTO<?> registerUser(@Valid @RequestBody UserRegistrationDTO user) {
        UserResponseDTO registeredUser = userService.registerUser(user);
        return ApiResponseDTO.ok(
                registeredUser,
                "User registered successfully!",
                HttpStatus.CREATED.value());
    }
    
    @GetMapping("/mobile/{mobile}")
    public ApiResponseDTO<?> getUserByMobile(@PathVariable String mobile) {
        return ApiResponseDTO.ok(
                userService.getUserByMobile(mobile),
                "User fetched successfully",
                HttpStatus.OK.value());
    }
    
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponseDTO<?> getAllUsers() {
        return ApiResponseDTO.ok(
                userService.getAllUsers(),
                "All users fetched",
                HttpStatus.OK.value());
    }
    
    @PostMapping("/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponseDTO<?> updateStatus(@RequestBody UpdateUserStatusDTO dto) {
        return ApiResponseDTO.ok(
                userService.updateUserStatus(dto.getPhoneNumber(), dto.getStatus()),
                "User status updated",
                HttpStatus.OK.value());
    }
    
    
}
