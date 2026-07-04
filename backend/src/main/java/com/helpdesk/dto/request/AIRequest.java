package com.helpdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AIRequest {

    @NotBlank(message = "Question is required")
    @Size(max = 4000, message = "Question must be less than 4000 characters")
    private String question;

    @Size(max = 120, message = "Context must be less than 120 characters")
    private String context;
}
