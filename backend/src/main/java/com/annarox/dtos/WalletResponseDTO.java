package com.annarox.dtos;

import java.math.BigDecimal;

import lombok.*;

@Builder
@Getter 
@Setter
public class WalletResponseDTO {
    private Long userId;
    private BigDecimal balance;
}