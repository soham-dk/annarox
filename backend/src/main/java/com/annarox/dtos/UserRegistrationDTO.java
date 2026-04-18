package com.annarox.dtos;

import com.annarox.enums.Role;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {

    @NotBlank(message = "PhoneNumber is required!")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number! Must be a 10-digit Indian mobile number.")
    private String phoneNumber;

    @NotBlank(message = "Password is required!")
    @Size(min = 4, max = 72, message = "Password must be between 4 and 72 characters!")
//    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$", message = "Password must contain atleast one digit, one uppercase, one lowercase and one special characters.")
    private String password;
}
