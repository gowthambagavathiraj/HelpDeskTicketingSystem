package com.helpdesk.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpdesk.dto.request.AIRequest;
import com.helpdesk.dto.request.TicketRequest;
import com.helpdesk.dto.response.AIResponse;
import com.helpdesk.dto.response.TicketResponse;
import com.helpdesk.entity.*;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GroqAIService {

    private static final String SYSTEM_INSTRUCTION_FORMAT = """
            You are CampusBot AI by QueryQuest, an intelligent and friendly campus assistant.
            
            Your capabilities:
            - Answer academic questions (courses, attendance, internal marks, exam schedule, syllabus, assignments, courses, registration, placement)
            - Provide administrative information (fee payments, hostel, library, transport, bus pass, office hours, holidays)
            - Help with IT and technical issues
            - Guide students through campus procedures
            
            Format your response strictly as a JSON object with the following fields:
            - "answer": A friendly, helpful, and concise answer to the student's question. Use Markdown formatting (bullet points, bold text) where appropriate.
            - "confidenceScore": A decimal number between 0.0 and 1.0 representing your confidence in this answer.
              * Set high (0.8 - 1.0) for standard FAQs or general campus knowledge.
              * Set low (below 0.6) if the question is highly specific, requires accessing a specific student's personal account records (like individual grade sheets, fee dues) that you do not have, or you do not know the answer.
            - "intent": The categorized intent of the question (e.g., "ATTENDANCE", "FEES", "EXAM_SCHEDULE", "HOSTEL", "BUS_PASS", "IT_SUPPORT", "PLACEMENT", "SCHOLARSHIP", etc.).
            - "sentiment": The detected student sentiment ("POSITIVE", "NEUTRAL", "FRUSTRATED", "URGENT").
            - "suggestedFAQs": A JSON array of 2 or 3 related FAQ questions that the student might want to ask next.
            - "suggestedDepartment": The campus department best suited to handle this query if a ticket is created. Must be exactly one of: "IT Support", "Maintenance", "HR", "Administration", "Finance", "Operations".
            - "suggestedPriority": The urgency of the ticket if created. Must be exactly one of: "LOW", "MEDIUM", "HIGH".
            
            Rules:
            1. Respond ONLY with the JSON object. Do not include any introductory or concluding text (e.g. "Here is the response:").
            2. If you don't know the answer or need private database details, state politely in the "answer" field that you cannot resolve this directly and will auto-generate a support ticket for them. Set "confidenceScore" to less than 0.6.
            
            Current Date: %s
            Academic Year: 2026-2027
            Current Semester: Spring 2026
            """;

    private final RestClient restClient;
    private final AILogRepository aiLogRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final TicketService ticketService;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;
    
    @Value("${ai.max-tokens:1500}")
    private int maxTokens;
    
    @Value("${ai.temperature:0.5}")
    private double temperature;

    public GroqAIService(RestClient.Builder restClientBuilder,
                          AILogRepository aiLogRepository,
                          UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          TicketService ticketService,
                          ObjectMapper objectMapper) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
        this.aiLogRepository = aiLogRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.ticketService = ticketService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AIResponse ask(AIRequest request, String sessionId, String userEmail) {
        if (!StringUtils.hasText(apiKey)) {
            throw new BadRequestException("Groq API key is not configured. Set GROQ_API_KEY environment variable and restart.");
        }

        log.info("Processing AI request - User: {}, Session: {}, Question length: {}", 
                 userEmail, sessionId, request.getQuestion().length());

        User user = null;
        if (StringUtils.hasText(userEmail)) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        // Get recent conversation history from Database instead of memory
        List<Map<String, String>> historyMessages = new ArrayList<>();
        if (StringUtils.hasText(sessionId)) {
            List<AILog> recentLogs = aiLogRepository.findRecentBySessionId(sessionId, PageRequest.of(0, 5));
            // The logs are returned in desc order of creation, we reverse to form proper conversation flow
            Collections.reverse(recentLogs);
            for (AILog logEntry : recentLogs) {
                historyMessages.add(Map.of("role", "user", "content", logEntry.getQuestion()));
                historyMessages.add(Map.of("role", "assistant", "content", logEntry.getAnswer()));
            }
        }

        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        String systemInstruction = String.format(SYSTEM_INSTRUCTION_FORMAT, currentDate);
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemInstruction));
        messages.addAll(historyMessages);
        messages.add(Map.of("role", "user", "content", request.getQuestion()));

        Map<String, Object> body = Map.of(
                "messages", messages,
                "model", model,
                "temperature", temperature,
                "max_tokens", maxTokens,
                "top_p", 0.9,
                "response_format", Map.of("type", "json_object") // Force JSON output
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
            
            String rawJson = extractRawResponse(response);
            StructuredAIResult aiResult = parseStructuredResponse(rawJson);

            boolean ticketCreated = false;
            Long ticketId = null;

            // Automatically create a ticket if confidence score is low (< 0.60) and user is authenticated
            if (aiResult.getConfidenceScore() < 0.60 && user != null) {
                try {
                    // Match department or find first
                    String deptName = aiResult.getSuggestedDepartment();
                    Department dept = departmentRepository.findByDepartmentName(deptName)
                            .orElseGet(() -> departmentRepository.findAll().stream().findFirst()
                                    .orElseThrow(() -> new ResourceNotFoundException("No departments available")));

                    Ticket.Priority priority = Ticket.Priority.MEDIUM;
                    try {
                        priority = Ticket.Priority.valueOf(aiResult.getSuggestedPriority().toUpperCase());
                    } catch (Exception ex) {
                        log.warn("Invalid priority parsed: {}, defaulting to MEDIUM", aiResult.getSuggestedPriority());
                    }

                    TicketRequest.Create ticketRequest = new TicketRequest.Create();
                    ticketRequest.setTitle("Auto-created ticket: " + (request.getQuestion().length() > 50 ? request.getQuestion().substring(0, 47) + "..." : request.getQuestion()));
                    ticketRequest.setDescription("AI auto-created ticket from chat interaction.\n\nStudent Query: " + request.getQuestion() + "\n\nAI Diagnostic Response: " + aiResult.getAnswer());
                    ticketRequest.setDepartmentId(dept.getId());
                    ticketRequest.setPriority(priority);

                    TicketResponse createdTicket = ticketService.createTicket(ticketRequest, user.getEmail(), null);
                    ticketCreated = true;
                    ticketId = createdTicket.getId();
                    
                    // Prepend/Append notice to answer
                    aiResult.setAnswer(aiResult.getAnswer() + "\n\n**Note:** A support ticket (#" + ticketId + ") has been automatically opened for you in the **" + dept.getDepartmentName() + "** department to resolve this issue manually. Support staff will contact you shortly.");
                    log.info("Successfully auto-created ticket #{} for user {}", ticketId, user.getEmail());
                } catch (Exception ticketEx) {
                    log.error("Failed to auto-create ticket for student: {}", ticketEx.getMessage(), ticketEx);
                }
            }

            // Save AI log entry in Database
            Ticket ticketReference = null;
            if (ticketId != null) {
                ticketReference = Ticket.builder().id(ticketId).build();
            }

            AILog aiLog = AILog.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .question(request.getQuestion())
                    .answer(aiResult.getAnswer())
                    .confidenceScore(BigDecimal.valueOf(aiResult.getConfidenceScore()))
                    .intent(aiResult.getIntent())
                    .sentiment(aiResult.getSentiment())
                    .ticketCreated(ticketCreated)
                    .ticket(ticketReference)
                    .build();
            aiLogRepository.save(aiLog);

            return AIResponse.builder()
                    .answer(aiResult.getAnswer())
                    .model(model)
                    .confidenceScore(aiResult.getConfidenceScore())
                    .intent(aiResult.getIntent())
                    .sentiment(aiResult.getSentiment())
                    .suggestedFAQs(aiResult.getSuggestedFAQs())
                    .ticketCreated(ticketCreated)
                    .ticketId(ticketId)
                    .build();
                    
        } catch (RestClientException ex) {
            log.error("Groq API request failed: {}", ex.getMessage(), ex);
            throw new BadRequestException("CampusBot is temporarily unavailable. Please try again in a moment.");
        }
    }

    private String extractRawResponse(Map<String, Object> response) {
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
        } catch (Exception e) {
            log.error("Error extracting text from AI response: {}", e.getMessage());
            throw new BadRequestException("Failed to read AI response. Please try again.");
        }
    }

    private StructuredAIResult parseStructuredResponse(String rawJson) {
        try {
            return objectMapper.readValue(rawJson, StructuredAIResult.class);
        } catch (Exception e) {
            log.error("Failed to parse structured JSON from LLM: {}. Raw content: {}", e.getMessage(), rawJson);
            // Fallback object
            StructuredAIResult fallback = new StructuredAIResult();
            fallback.setAnswer(rawJson);
            fallback.setConfidenceScore(0.50);
            fallback.setIntent("UNKNOWN");
            fallback.setSentiment("NEUTRAL");
            fallback.setSuggestedFAQs(Arrays.asList("How can CampusBot help me?", "Where is the admin office?"));
            fallback.setSuggestedDepartment("Administration");
            fallback.setSuggestedPriority("MEDIUM");
            return fallback;
        }
    }

    // List context-aware suggestions directly
    public List<String> getSuggestedQuestions(String context) {
        Map<String, List<String>> suggestions = Map.of(
                "Academic queries", List.of(
                        "When is the final exam for Computer Science 101?",
                        "What is the minimum attendance requirement?",
                        "What are the placement cell timings?",
                        "How do I submit my course registration?"
                ),
                "Administrative queries", List.of(
                        "How do I apply for a Bus Pass?",
                        "What is the process to apply for a scholarship?",
                        "How can I pay my semester fees online?",
                        "What are the office timings for administration?"
                )
        );
        return suggestions.getOrDefault(context, List.of(
                "What is the grading system?",
                "How do I create a support ticket?",
                "How can CampusBot help me?"
        ));
    }

    public void clearConversationHistory(String sessionId) {
        // Since we write to the database, clearing conversation history for a session means deleting logs
        // But for statistics we might want to keep the logs. Let's just unlink user or mark deleted,
        // or actually delete session logs if requested. To keep it clean, we'll keep the logs for analytics,
        // but can return empty array or ignore sessionId if cleared. Let's delete session logs for actual clear
        // to free user conversation space.
        List<AILog> sessionLogs = aiLogRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        aiLogRepository.deleteAll(sessionLogs);
        log.info("Deleted conversation history logs for session: {}", sessionId);
    }

    // Helper inner class for JSON mapping
    @lombok.Data
    public static class StructuredAIResult {
        private String answer;
        private double confidenceScore;
        private String intent;
        private String sentiment;
        private List<String> suggestedFAQs = new ArrayList<>();
        private String suggestedDepartment = "Administration";
        private String suggestedPriority = "MEDIUM";
    }
}
