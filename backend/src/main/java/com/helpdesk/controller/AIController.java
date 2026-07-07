package com.helpdesk.controller;

import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.response.AILogResponse;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.entity.AILog;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.AILogRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.service.GroqAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Assistant", description = "CampusBot AI endpoints for intelligent assistance")
public class AIController {

    private final GroqAIService groqAIService;
    private final AILogRepository aiLogRepository;
    private final UserRepository userRepository;

    @PostMapping("/ask")
    @Operation(summary = "Ask CampusBot a question", description = "Get AI-powered answers to academic and administrative queries")
    public ResponseEntity<ApiResponse<AIResponse>> ask(
            @Valid @RequestBody AIRequest request,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        log.info("Received AI request from user: {}, session: {}", userEmail, sessionId);
        
        AIResponse response = groqAIService.ask(request, sessionId, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("AI response generated", response));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get suggested questions", description = "Get context-aware suggested questions")
    public ResponseEntity<ApiResponse<List<String>>> getSuggestions(
            @RequestParam(defaultValue = "Academic queries") String context) {
        
        List<String> suggestions = groqAIService.getSuggestedQuestions(context);
        return ResponseEntity.ok(ApiResponse.ok("Suggestions retrieved", suggestions));
    }

    @DeleteMapping("/history/{sessionId}")
    @Operation(summary = "Clear conversation history", description = "Clear conversation history for a specific session")
    public ResponseEntity<ApiResponse<Void>> clearHistory(@PathVariable String sessionId) {
        groqAIService.clearConversationHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Conversation history cleared", null));
    }

    @GetMapping("/history")
    @Operation(summary = "Get chat history", description = "Get conversation history for the current authenticated user")
    public ResponseEntity<ApiResponse<List<AILogResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
        
        List<AILogResponse> history = aiLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get AI Logs", description = "Get all AI interaction logs for performance monitoring (Admin only)")
    public ResponseEntity<ApiResponse<List<AILogResponse>>> getLogs() {
        List<AILogResponse> logs = aiLogRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/health")
    @Operation(summary = "Check AI service health", description = "Verify CampusBot AI service is operational")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = Map.of(
                "status", "UP",
                "service", "CampusBot AI",
                "model", "Llama 3.3 70B",
                "provider", "Groq"
        );
        return ResponseEntity.ok(ApiResponse.ok("AI service is healthy", health));
    }

    private AILogResponse mapToResponse(AILog log) {
        return AILogResponse.builder()
                .id(log.getId())
                .studentName(log.getUser() != null ? log.getUser().getName() : "Anonymous")
                .studentEmail(log.getUser() != null ? log.getUser().getEmail() : "anonymous@helpdesk.com")
                .sessionId(log.getSessionId())
                .question(log.getQuestion())
                .answer(log.getAnswer())
                .confidenceScore(log.getConfidenceScore())
                .intent(log.getIntent())
                .sentiment(log.getSentiment())
                .ticketCreated(log.getTicketCreated())
                .ticketId(log.getTicket() != null ? log.getTicket().getId() : null)
                .createdAt(log.getCreatedAt())
                .build();
    }
}
