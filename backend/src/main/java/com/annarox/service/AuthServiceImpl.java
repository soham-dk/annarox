package com.annarox.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.annarox.dtos.AuthResponseDTO;
import com.annarox.dtos.UserLoginDTO;
import com.annarox.dtos.UserResponseDTO;
import com.annarox.exception.UserDoesNotExist;
import com.annarox.repository.AuthRepository;
import com.annarox.repository.UserRepository;
import com.annarox.security.JwtService;
import com.annarox.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;

    private final PasswordEncoder passwordEncoder;
    
    private final JwtService jwtService;
    
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AuthResponseDTO login(UserLoginDTO loginDTO) {

        User user = authRepository.findByPhoneNumber(loginDTO.getPhoneNumber())
                .orElseThrow(() -> new UserDoesNotExist(
                        "User does not exist with phone " + loginDTO.getPhoneNumber()));

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getPhoneNumber());
        System.out.println("TOKEN "+token);

        return AuthResponseDTO.builder()
                .token(token)
                .user(mapToDTO(user))
                .build();
    }
    
    @Override
    public void forgotPassword(String phoneNumber) {

        userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Override
    public void resetPassword(String phoneNumber, String newPassword) {

        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }

    private UserResponseDTO mapToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .role(user.getRole())
                .build();
    }
}
