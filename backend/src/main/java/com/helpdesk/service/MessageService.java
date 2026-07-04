package com.helpdesk.service;

import com.helpdesk.dto.request.MessageRequest;
import com.helpdesk.dto.response.MessageResponse;
import com.helpdesk.entity.Message;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.MessageRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketService ticketService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(Long ticketId, MessageRequest request, String senderEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + senderEmail));

        // Validate access: must be ticket creator, assigned staff, or admin
        validateMessageAccess(ticket, sender);

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new UnauthorizedException("Cannot send messages to a closed ticket.");
        }

        Message message = Message.builder()
                .ticket(ticket)
                .sender(sender)
                .message(request.getMessage())
                .build();

        message = messageRepository.save(message);
        MessageResponse response = mapToResponse(message);

        // Broadcast via WebSocket to all subscribers of this ticket
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, response);
        log.info("Message sent to ticket #{} by {}", ticketId, senderEmail);

        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        validateMessageAccess(ticket, user);

        return messageRepository.findByTicketIdOrderByTimestampAsc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateMessageAccess(Ticket ticket, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        if (user.getRole() == User.Role.SUPPORT_STAFF &&
                ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId())) return;
        if (ticket.getCreatedBy().getId().equals(user.getId())) return;
        throw new UnauthorizedException("You don't have access to this ticket's messages.");
    }

    public MessageResponse mapToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .ticketId(message.getTicket().getId())
                .sender(ticketService.mapUserToResponse(message.getSender()))
                .message(message.getMessage())
                .attachmentUrl(message.getAttachmentUrl())
                .timestamp(message.getTimestamp())
                .build();
    }
}
