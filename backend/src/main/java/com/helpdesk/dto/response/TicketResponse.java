package com.helpdesk.dto.response;

import com.helpdesk.entity.Ticket;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private Ticket.Priority priority;
    private Ticket.Status status;
    private UserResponse createdBy;
    private UserResponse assignedTo;
    private DepartmentResponse department;
    private String attachmentUrl;
    private long messageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
}
