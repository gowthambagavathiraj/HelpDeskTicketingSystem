package com.helpdesk.controller;

import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.service.GroqAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final GroqAIService groqAIService;

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AIResponse>> ask(@Valid @RequestBody AIRequest request) {
        AIResponse response = groqAIService.ask(request);
        return ResponseEntity.ok(ApiResponse.ok("AI response generated", response));
    }
}
