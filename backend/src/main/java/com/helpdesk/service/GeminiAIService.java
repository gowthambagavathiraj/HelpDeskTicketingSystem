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
import java.util.stream.Collectors;

@Service
@Slf4j
public class GeminiAIService {

    private static final String SYSTEM_INSTRUCTION = """
            You are CampusBot AI by QueryQuest, a concise helpdesk support agent inside a campus ticketing system.
            Help users with IT issues, academic queries, administrative questions, draft clear ticket descriptions, 
            suggest priority, recommend next steps for support staff, and keep responses practical. 
            For academic queries, provide helpful information about courses, assignments, schedules, and policies.
            For administrative queries, assist with registration, fees, facilities, and campus procedures.
            Do not invent ticket records or claim actions were performed in the system.
            """;

    private final RestClient restClient;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash}")
    private String model;

    public GeminiAIService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    public AIResponse ask(AIRequest request) {
        if (!StringUtils.hasText(apiKey)) {
            throw new BadRequestException("Gemini API key is not configured. Set GEMINI_API_KEY and restart the backend.");
        }

        String input = buildInput(request);
        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))
                ),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", input))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 1200
                )
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/models/{model}:generateContent?key={apiKey}", normalizedModel(), apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            String answer = extractAnswer(response);
            return AIResponse.builder()
                    .answer(answer)
                    .model(model)
                    .build();
        } catch (RestClientException ex) {
            log.error("Gemini request failed", ex);
            throw new BadRequestException("Gemini could not answer right now. Check your API key, model, or quota.");
        }
    }

    private String buildInput(AIRequest request) {
        String context = StringUtils.hasText(request.getContext()) ? request.getContext().trim() : "General helpdesk support";
        return "Context: " + context + "\n\nUser request:\n" + request.getQuestion().trim();
    }

    private String normalizedModel() {
        return model.startsWith("models/") ? model.substring("models/".length()) : model;
    }

    private String extractAnswer(Map<String, Object> response) {
        if (response == null) {
            throw new BadRequestException("Gemini returned an empty response.");
        }

        Object candidates = response.get("candidates");
        if (candidates instanceof List<?> candidateList && !candidateList.isEmpty()) {
            String answer = candidateList.stream()
                    .map(this::extractCandidateText)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.joining("\n\n"))
                    .trim();
            if (StringUtils.hasText(answer)) return answer;
        }

        throw new BadRequestException("Gemini returned a response without text.");
    }

    private String extractCandidateText(Object candidate) {
        if (!(candidate instanceof Map<?, ?> candidateMap)) return "";

        Object content = candidateMap.get("content");
        if (!(content instanceof Map<?, ?> contentMap)) return "";

        Object parts = contentMap.get("parts");
        if (!(parts instanceof List<?> partList)) return "";

        return partList.stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(part -> part.get("text"))
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining("\n"));
    }
}
