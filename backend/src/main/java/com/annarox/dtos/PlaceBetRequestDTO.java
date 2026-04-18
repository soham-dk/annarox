package com.annarox.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

 
@Setter
@Getter
public class PlaceBetRequestDTO {
    
    @NotBlank
    private Integer number;
    @NotBlank
    private BigDecimal tokens;
}