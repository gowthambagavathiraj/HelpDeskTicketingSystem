package com.helpdesk.service;

import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqAIService {

    private static final String SYSTEM_INSTRUCTION = """
            You are CampusBot AI by QueryQuest, a concise helpdesk support agent inside a campus ticketing system.
            Help users with IT issues, academic queries, administrative questions, draft clear ticket descriptions, 
            suggest priority, recommend next steps for support staff, and keep responses practical. 
            For academic queries, provide helpful information about courses, assignments, schedules, and policies.
            For administrative queries, assist with registration, fees, facilities, and campus procedures.
            Do not invent ticket records or claim actions were performed in the system.
            """;

    private final RestClient restClient;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    public GroqAIService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public AIResponse ask(AIRequest request) {
        if (!StringUtils.hasText(apiKey)) {
            throw new BadRequestException("Groq API key is not configured. Set GROQ_API_KEY and restart the backend.");
        }

        log.info("Using Groq model: {}", model);

        String input = buildInput(request);
        
        // Groq uses OpenAI-compatible API format
        Map<String, Object> body = Map.of(
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_INSTRUCTION),
                        Map.of("role", "user", "content", input)
                ),
                "model", model,
                "temperature", 0.4,
                "max_tokens", 1200
        );

        try {
            log.info("Making request to Groq API...");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            log.info("Groq API response received successfully");
            String answer = extractAnswer(response);
            return AIResponse.builder()
                    .answer(answer)
                    .model(model)
                    .build();
        } catch (RestClientException ex) {
            log.error("Groq request failed. Error: {}", ex.getMessage(), ex);
            throw new BadRequestException("Groq AI could not answer right now. Error: " + ex.getMessage());
        }
    }

    private String buildInput(AIRequest request) {
        String context = StringUtils.hasText(request.getContext()) ? request.getContext().trim() : "General helpdesk support";
        return "Context: " + context + "\n\nUser request:\n" + request.getQuestion().trim();
    }

    private String extractAnswer(Map<String, Object> response) {
        if (response == null) {
            throw new BadRequestException("Groq returned an empty response.");
        }

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                if (message != null) {
                    String content = (String) message.get("content");
                    if (StringUtils.hasText(content)) {
                        return content.trim();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Groq response", e);
        }

        throw new BadRequestException("Groq returned a response without text.");
    }
}
