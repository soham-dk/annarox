package com.annarox.service;

import com.annarox.dtos.AuthResponseDTO;
import com.annarox.dtos.UserLoginDTO;
import com.annarox.dtos.UserResponseDTO;

public interface AuthService {
    AuthResponseDTO login(UserLoginDTO loginDTO);
    void forgotPassword(String phoneNumber);
    void resetPassword(String phoneNumber, String newPassword);
}
