package com.annarox.dtos;

import com.annarox.dtos.UserResponseDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    private UserResponseDTO user;
}		