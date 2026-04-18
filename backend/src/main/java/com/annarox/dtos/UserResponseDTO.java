package com.annarox.dtos;

import com.annarox.enums.Role;
import com.annarox.enums.UserStatus;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class UserResponseDTO {

    private Long id;
    private String phoneNumber;
    private Role role;
    private UserStatus status;
}
