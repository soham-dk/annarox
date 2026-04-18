package com.annarox.service;

import java.util.List;

import com.annarox.dtos.UserRegistrationDTO;
import com.annarox.dtos.UserResponseDTO;
import com.annarox.dtos.UserWalletProjection;

public interface UserService {
       UserResponseDTO registerUser(UserRegistrationDTO userDTO);
       UserResponseDTO updateUserStatus(String userPhoneNumber, String status);
       List<UserWalletProjection> getAllUsers();
       UserResponseDTO getUserByMobile(String mobile);
}
