package com.helpdesk.controller;

import com.helpdesk.dto.request.TicketRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.TicketResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestPart("ticket") TicketRequest.Create request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.createTicket(request, userDetails.getUsername(), file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket created successfully", response));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<TicketResponse>> createTicketJson(
            @Valid @RequestBody TicketRequest.Create request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.createTicket(request, userDetails.getUsername(), null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getTickets(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Ticket.Status status,
            @RequestParam(required = false) Ticket.Priority priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {
        Page<TicketResponse> tickets = ticketService.getTickets(
                userDetails.getUsername(), keyword, status, priority, departmentId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.getTicketById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest.UpdateStatus request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.updateStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Ticket status updated", response));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest.Assign request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.assignTicket(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Ticket assigned successfully", response));
    }
}
