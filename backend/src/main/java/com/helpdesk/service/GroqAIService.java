package com.helpdesk.service;

import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class GroqAIService {

    private static final String BASE_SYSTEM_INSTRUCTION = """
            You are CampusBot AI by QueryQuest, an intelligent and friendly campus assistant.
            
            Your capabilities:
            - Answer academic questions (courses, assignments, exams, schedules)
            - Provide administrative information (registration, fees, scholarships, facilities)
            - Help with IT and technical issues
            - Guide students through campus procedures
            - Suggest relevant resources and contacts
            
            Guidelines:
            - Be concise but comprehensive
            - Use bullet points for lists
            - Include specific steps when giving instructions
            - Mention relevant deadlines or time-sensitive information
            - If you don't know something, suggest who to contact
            - Always be professional yet friendly
            - For urgent issues, recommend immediate action
            
            Current Date: %s
            Academic Year: 2026-2027
            Current Semester: Spring 2026
            """;

    private static final Map<String, String> CONTEXT_ENHANCEMENTS = Map.of(
            "Academic queries", "Focus on course content, exam dates, assignment deadlines, grading policies, and professor office hours.",
            "Course information", "Provide details about course credits, prerequisites, syllabus, schedule, and learning outcomes.",
            "Exam schedules", "Include exam dates, duration, format (online/offline), allowed materials, and preparation tips.",
            "Registration", "Explain step-by-step registration process, required documents, deadlines, and troubleshooting common issues.",
            "Fee information", "Break down fee structure, payment methods, due dates, late fees, and available payment plans.",
            "Scholarships", "List eligibility criteria, application process, required documents, deadlines, and selection process.",
            "Library services", "Describe available resources, borrowing policies, digital access, study spaces, and hours.",
            "Hostel information", "Cover room allocation, fees, facilities, rules, meal plans, and guest policies.",
            "Troubleshooting", "Provide systematic diagnosis steps, common solutions, and when to escalate to support staff."
    );

    private final RestClient restClient;
    private final Map<String, List<Map<String, String>>> conversationHistory = new ConcurrentHashMap<>();

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;
    
    @Value("${ai.max-tokens:1500}")
    private int maxTokens;
    
    @Value("${ai.temperature:0.5}")
    private double temperature;

    public GroqAIService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public AIResponse ask(AIRequest request) {
        return ask(request, null);
    }

    public AIResponse ask(AIRequest request, String sessionId) {
        if (!StringUtils.hasText(apiKey)) {
            throw new BadRequestException("Groq API key is not configured. Set GROQ_API_KEY environment variable and restart.");
        }

        log.info("Processing AI request - Context: {}, Question length: {}", 
                 request.getContext(), request.getQuestion().length());

        String enhancedSystemPrompt = buildEnhancedSystemPrompt(request.getContext());
        String userMessage = buildEnhancedUserMessage(request);
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", enhancedSystemPrompt));
        
        // Add conversation history if session exists
        if (sessionId != null && conversationHistory.containsKey(sessionId)) {
            messages.addAll(conversationHistory.get(sessionId));
        }
        
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = Map.of(
                "messages", messages,
                "model", model,
                "temperature", temperature,
                "max_tokens", maxTokens,
                "top_p", 0.9,
                "frequency_penalty", 0.3,
                "presence_penalty", 0.2
        );

        try {
            long startTime = System.currentTimeMillis();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            long responseTime = System.currentTimeMillis() - startTime;
            log.info("Groq API response received in {}ms", responseTime);
            
            String answer = extractAnswer(response);
            
            // Store conversation history
            if (sessionId != null) {
                List<Map<String, String>> history = conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
                history.add(Map.of("role", "user", "content", userMessage));
                history.add(Map.of("role", "assistant", "content", answer));
                
                // Keep only last 6 messages (3 exchanges) to manage context window
                if (history.size() > 6) {
                    history = new ArrayList<>(history.subList(history.size() - 6, history.size()));
                    conversationHistory.put(sessionId, history);
                }
            }
            
            return AIResponse.builder()
                    .answer(formatAnswer(answer))
                    .model(model)
                    .build();
                    
        } catch (RestClientException ex) {
            log.error("Groq API request failed: {}", ex.getMessage(), ex);
            
            if (ex.getMessage().contains("429")) {
                throw new BadRequestException("API rate limit exceeded. Please wait a moment and try again.");
            } else if (ex.getMessage().contains("401")) {
                throw new BadRequestException("Invalid API key. Please check your Groq API configuration.");
            } else if (ex.getMessage().contains("timeout")) {
                throw new BadRequestException("Request timed out. Please try with a shorter question.");
            }
            
            throw new BadRequestException("CampusBot is temporarily unavailable. Please try again in a moment.");
        }
    }

    private String buildEnhancedSystemPrompt(String context) {
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        String basePrompt = String.format(BASE_SYSTEM_INSTRUCTION, currentDate);
        
        String contextEnhancement = CONTEXT_ENHANCEMENTS.getOrDefault(
            context, 
            "Provide helpful and accurate information based on the user's question."
        );
        
        return basePrompt + "\n\nSpecific Context: " + contextEnhancement;
    }

    private String buildEnhancedUserMessage(AIRequest request) {
        StringBuilder message = new StringBuilder();
        
        if (StringUtils.hasText(request.getContext())) {
            message.append("[Context: ").append(request.getContext()).append("]\n\n");
        }
        
        message.append(request.getQuestion().trim());
        
        return message.toString();
    }

    private String extractAnswer(Map<String, Object> response) {
        if (response == null) {
            throw new BadRequestException("Received empty response from AI service.");
        }

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            
            if (choices == null || choices.isEmpty()) {
                throw new BadRequestException("No response choices available.");
            }
            
            Map<String, Object> firstChoice = choices.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            
            if (message == null) {
                throw new BadRequestException("No message in response.");
            }
            
            String content = (String) message.get("content");
            
            if (!StringUtils.hasText(content)) {
                throw new BadRequestException("Empty content in response.");
            }
            
            return content.trim();
            
        } catch (ClassCastException | NullPointerException e) {
            log.error("Error parsing AI response structure: {}", e.getMessage());
            throw new BadRequestException("Failed to parse AI response. Please try again.");
        }
    }

    private String formatAnswer(String answer) {
        // Clean up the answer for better presentation
        return answer
                .replaceAll("(?m)^\\s+", "")  // Remove leading spaces
                .replaceAll("(?m)\\s+$", "")  // Remove trailing spaces
                .replaceAll("\n{3,}", "\n\n") // Max 2 consecutive newlines
                .trim();
    }

    public void clearConversationHistory(String sessionId) {
        conversationHistory.remove(sessionId);
        log.info("Cleared conversation history for session: {}", sessionId);
    }

    public void clearAllHistory() {
        conversationHistory.clear();
        log.info("Cleared all conversation history");
    }

    @Cacheable(value = "aiSuggestions", key = "#context")
    public List<String> getSuggestedQuestions(String context) {
        // Provide context-aware suggested questions
        Map<String, List<String>> suggestions = Map.of(
                "Academic queries", List.of(
                        "When is the final exam for Computer Science 101?",
                        "What are the prerequisites for Data Structures course?",
                        "How can I access the course materials online?",
                        "What is the grading policy for this semester?"
                ),
                "Administrative queries", List.of(
                        "How do I apply for a merit scholarship?",
                        "What documents are needed for hostel registration?",
                        "When is the last date for course registration?",
                        "How can I pay my semester fees online?"
                ),
                "Registration", List.of(
                        "What is the course registration process?",
                        "Can I drop a course after registration?",
                        "How do I add an elective course?",
                        "What if I missed the registration deadline?"
                )
        );
        
        return suggestions.getOrDefault(context, List.of(
                "How can CampusBot help me?",
                "What services are available on campus?",
                "Who do I contact for technical support?",
                "Where can I find academic resources?"
        ));
    }
}
