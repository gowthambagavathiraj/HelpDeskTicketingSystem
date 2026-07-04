package com.helpdesk.controller;

import com.helpdesk.dto.request.MessageRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.MessageResponse;
import com.helpdesk.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MessageResponse response = messageService.sendMessage(ticketId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MessageResponse> messages = messageService.getMessages(ticketId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    // WebSocket endpoint for real-time messaging
    @MessageMapping("/ticket/{ticketId}/send")
    public void sendMessageWs(
            @DestinationVariable Long ticketId,
            @Payload MessageRequest request,
            Principal principal) {
        if (principal != null) {
            messageService.sendMessage(ticketId, request, principal.getName());
        }
    }
}
