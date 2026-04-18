package com.annarox.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserLoginDTO {

    @NotBlank(message = "Phone Number is required!")
    private String phoneNumber;

    @NotBlank(message = "Password is required!")
    private String password;

}
