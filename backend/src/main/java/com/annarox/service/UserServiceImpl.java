package com.annarox.service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.annarox.dtos.UserRegistrationDTO;
import com.annarox.dtos.UserResponseDTO;
import com.annarox.dtos.UserWalletProjection;
import com.annarox.entity.User;
import com.annarox.enums.Role;
import com.annarox.enums.UserStatus;
import com.annarox.exception.UserAlreadyExistsException;
import com.annarox.exception.UserDoesNotExist;
import com.annarox.mapper.UserMapper;
import com.annarox.repository.UserRepository;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper; // Mapstruct mapper injection
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;
    @Override
    @Transactional
    public UserResponseDTO registerUser(UserRegistrationDTO userDTO) {

        if (userRepository.existsByPhoneNumber(userDTO.getPhoneNumber())) {
            throw new UserAlreadyExistsException("User with phone number " + userDTO.getPhoneNumber() + " already exists!");
        }
        User user = userMapper.toEntity(userDTO);
//        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        User registeredUser = userRepository.save(user);
        // 🔥 create wallet automatically
        walletService.createWallet(registeredUser);

        return userMapper.toDTO(registeredUser);
    }
    
    @Override
    public UserResponseDTO getUserByMobile(String mobile) {

        User user = userRepository.findByPhoneNumber(mobile)
                .orElseThrow(() -> new UserDoesNotExist("User not found"));

        return mapToDTO(user);
    }

    // ─── 2. Get all users ────────────────────────

    @Override
    public List<UserWalletProjection> getAllUsers() {

        return userRepository.findByRole(Role.USER);
                
    }

    // ─── 3. Update user status ───────────────────

    @Override
    @Transactional
    public UserResponseDTO updateUserStatus(String userPhoneNumber, String status) {
        User user = userRepository.findByPhoneNumber(userPhoneNumber)
                .orElseThrow(() -> new UserDoesNotExist("User not found"));

        UserStatus newStatus;
        try {
            newStatus = UserStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid status value");
        }

        user.setStatus(newStatus);

        return mapToDTO(user);
    }

    // ─── Mapper ─────────────────────────────────

    private UserResponseDTO mapToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .role(user.getRole())
                .build();
    }
}
