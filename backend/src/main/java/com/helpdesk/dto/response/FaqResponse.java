package com.helpdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqResponse {
    private Long id;
    private String question;
    private String answer;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
