package com.helpdesk.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long ticketId;
    private UserResponse sender;
    private String message;
    private String attachmentUrl;
    private LocalDateTime timestamp;
}
