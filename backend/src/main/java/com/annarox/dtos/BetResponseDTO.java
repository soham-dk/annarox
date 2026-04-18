package com.annarox.dtos;

import java.math.BigDecimal;

import lombok.*;

@Builder
@Getter 
@Setter
public class BetResponseDTO {
    private Long betId;
    private Long roundId;
    private Integer number;
    private BigDecimal tokens;
    private Boolean won;
}