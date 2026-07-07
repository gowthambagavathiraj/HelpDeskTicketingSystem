package com.helpdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class FaqRequest {

    @Data
    public static class Create {
        @NotBlank(message = "Question is required")
        @Size(max = 500, message = "Question must be less than 500 characters")
        private String question;

        @NotBlank(message = "Answer is required")
        private String answer;

        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category must be less than 100 characters")
        private String category;
    }

    @Data
    public static class Update {
        @Size(max = 500, message = "Question must be less than 500 characters")
        private String question;

        private String answer;

        @Size(max = 100, message = "Category must be less than 100 characters")
        private String category;
    }
}
