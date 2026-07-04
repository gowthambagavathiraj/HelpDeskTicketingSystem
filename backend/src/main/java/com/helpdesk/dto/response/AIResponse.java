package com.helpdesk.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIResponse {
    private String answer;
    private String model;
}
