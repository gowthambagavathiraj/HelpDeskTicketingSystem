package com.helpdesk.controller;

import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.service.GroqAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Assistant", description = "CampusBot AI endpoints for intelligent assistance")
public class AIController {

    private final GroqAIService groqAIService;

    @PostMapping("/ask")
    @Operation(summary = "Ask CampusBot a question", description = "Get AI-powered answers to academic and administrative queries")
    public ResponseEntity<ApiResponse<AIResponse>> ask(
            @Valid @RequestBody AIRequest request,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        
        log.info("Received AI request from session: {}", sessionId);
        AIResponse response = groqAIService.ask(request, sessionId);
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
}
