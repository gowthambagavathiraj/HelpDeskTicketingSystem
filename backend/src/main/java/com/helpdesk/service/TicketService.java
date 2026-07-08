package com.helpdesk.service;

import com.helpdesk.dto.request.TicketRequest;
import com.helpdesk.dto.response.*;
import com.helpdesk.entity.Department;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.DepartmentRepository;
import com.helpdesk.repository.MessageRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public TicketResponse createTicket(TicketRequest.Create request, String userEmail, MultipartFile file) {
        User user = getUserByEmail(userEmail);
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));

        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            attachmentUrl = saveFile(file);
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(Ticket.Status.OPEN)
                .createdBy(user)
                .department(department)
                .attachmentUrl(attachmentUrl)
                .build();

        ticket = ticketRepository.save(ticket);
        
        // Send email notification to user
        emailService.sendTicketCreatedEmail(user, ticket);
        
        log.info("Ticket #{} created by user {}", ticket.getId(), userEmail);
        return mapToResponse(ticket);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getTickets(String userEmail, String keyword, Ticket.Status status,
                                            Ticket.Priority priority, Long departmentId,
                                            int page, int size, String sortBy, String sortDir) {
        User user = getUserByEmail(userEmail);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Ticket> tickets;
        if (user.getRole() == User.Role.ADMIN) {
            tickets = ticketRepository.searchTickets(keyword, status, priority, departmentId, pageable);
        } else {
            tickets = ticketRepository.searchTicketsByUser(user, keyword, status, pageable);
        }
        return tickets.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id, String userEmail) {
        Ticket ticket = getTicketOrThrow(id);
        User user = getUserByEmail(userEmail);
        validateTicketAccess(ticket, user);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, TicketRequest.UpdateStatus request, String userEmail) {
        Ticket ticket = getTicketOrThrow(id);
        User user = getUserByEmail(userEmail);

        // Only admin, support staff assigned to ticket, or ticket creator can update
        if (user.getRole() == User.Role.USER && !ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to update this ticket's status.");
        }

        // Users can only close their own tickets, not set other statuses
        if (user.getRole() == User.Role.USER && request.getStatus() != Ticket.Status.CLOSED) {
            throw new BadRequestException("Users can only close tickets.");
        }

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());
        if (request.getStatus() == Ticket.Status.CLOSED || request.getStatus() == Ticket.Status.RESOLVED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        ticketRepository.save(ticket);
        
        // Send email notification to ticket creator
        emailService.sendTicketStatusChangeEmail(ticket.getCreatedBy(), ticket, oldStatus);
        
        log.info("Ticket #{} status changed from {} to {} by {}", id, oldStatus, request.getStatus(), userEmail);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long id, TicketRequest.Assign request, String adminEmail) {
        Ticket ticket = getTicketOrThrow(id);
        User assignee = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedToId()));

        if (assignee.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Cannot assign ticket to a regular user. Only admins can be assigned.");
        }

        ticket.setAssignedTo(assignee);
        if (ticket.getStatus() == Ticket.Status.OPEN) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
        }
        ticketRepository.save(ticket);

        // Send email notification
        emailService.sendTicketAssignmentEmail(assignee, ticket);
        log.info("Ticket #{} assigned to {} by admin {}", id, assignee.getEmail(), adminEmail);
        return mapToResponse(ticket);
    }

    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new BadRequestException("Failed to upload file.");
        }
    }

    private void validateTicketAccess(Ticket ticket, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        if (ticket.getCreatedBy().getId().equals(user.getId())) return;
        throw new UnauthorizedException("You don't have access to this ticket.");
    }

    private Ticket getTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public TicketResponse mapToResponse(Ticket ticket) {
        long msgCount = messageRepository.countByTicketId(ticket.getId());
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(mapUserToResponse(ticket.getCreatedBy()))
                .assignedTo(ticket.getAssignedTo() != null ? mapUserToResponse(ticket.getAssignedTo()) : null)
                .department(DepartmentResponse.builder()
                        .id(ticket.getDepartment().getId())
                        .departmentName(ticket.getDepartment().getDepartmentName())
                        .build())
                .attachmentUrl(ticket.getAttachmentUrl())
                .messageCount(msgCount)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .closedAt(ticket.getClosedAt())
                .build();
    }

    public UserResponse mapUserToResponse(User user) {
        if (user == null) return null;
        DepartmentResponse dept = user.getDepartment() != null ?
                DepartmentResponse.builder()
                        .id(user.getDepartment().getId())
                        .departmentName(user.getDepartment().getDepartmentName())
                        .build() : null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(dept)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
