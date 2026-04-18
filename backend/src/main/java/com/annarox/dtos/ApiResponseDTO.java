package com.annarox.dtos;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseDTO<T> {
    private boolean success;
    private int status;
    private String message;
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private T data;
    private String path;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponseDTO<T> ok(T data, String message, int status) {
        return ApiResponseDTO.<T>builder()
                .success(true)
                .status(status)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponseDTO<T> error(String path, String message, int status) {
        return ApiResponseDTO.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .path(path)
                .build();
    }

}
