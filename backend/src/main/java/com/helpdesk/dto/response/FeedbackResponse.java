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
public class FeedbackResponse {
    private Long id;
    private String studentName;
    private String studentEmail;
    private Integer aiRating;
    private Integer staffRating;
    private Integer overallRating;
    private String comment;
    private LocalDateTime createdAt;
}
