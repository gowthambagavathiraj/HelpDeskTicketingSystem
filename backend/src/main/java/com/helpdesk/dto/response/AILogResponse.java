package com.helpdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AILogResponse {
    private Long id;
    private String studentName;
    private String studentEmail;
    private String sessionId;
    private String question;
    private String answer;
    private BigDecimal confidenceScore;
    private String intent;
    private String sentiment;
    private Boolean ticketCreated;
    private Long ticketId;
    private LocalDateTime createdAt;
}
