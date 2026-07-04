package com.helpdesk.dto.request;

import com.helpdesk.entity.Ticket;
import jakarta.validation.constraints.*;
import lombok.Data;

public class TicketRequest {

    @Data
    public static class Create {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        private String title;

        @NotBlank(message = "Description is required")
        @Size(min = 10, message = "Description must be at least 10 characters")
        private String description;

        @NotNull(message = "Priority is required")
        private Ticket.Priority priority;

        @NotNull(message = "Department is required")
        private Long departmentId;
    }

    @Data
    public static class UpdateStatus {
        @NotNull(message = "Status is required")
        private Ticket.Status status;
    }

    @Data
    public static class Assign {
        @NotNull(message = "Support staff ID is required")
        private Long assignedToId;
    }
}
