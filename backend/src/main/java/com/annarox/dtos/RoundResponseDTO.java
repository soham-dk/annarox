package com.annarox.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL) 
public class RoundResponseDTO {
    private Long id;
    private String name;
    private String status;
    private Integer winningNumber;
}