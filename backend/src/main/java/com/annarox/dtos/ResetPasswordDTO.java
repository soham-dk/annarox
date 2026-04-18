package com.annarox.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordDTO {
    private String phoneNumber;
    private String newPassword;
}