package com.annarox.dtos;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoundStatsResponseDTO {

    private Long roundId;
    private Long totalBets;
    private List<NumberStatDTO> numberStats;

}