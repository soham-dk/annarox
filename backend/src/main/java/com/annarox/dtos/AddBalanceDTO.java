package com.annarox.dtos;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
public class AddBalanceDTO {
	private Long userId;        // target user
    private BigDecimal amount;
}