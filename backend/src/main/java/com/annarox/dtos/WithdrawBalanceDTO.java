package com.annarox.dtos;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
public class WithdrawBalanceDTO {
	BigDecimal amount;

}
