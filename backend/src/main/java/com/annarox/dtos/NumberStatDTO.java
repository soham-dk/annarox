package com.annarox.dtos;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NumberStatDTO {
    private Integer number;
    private Long count;
    private BigDecimal totalAmount;
}