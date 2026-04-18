package com.annarox.dtos;

import lombok.Data;

@Data
public class UpdateUserStatusDTO {

    private String phoneNumber;
    private String status; // ACTIVE / INACTIVE / BLOCKED

}