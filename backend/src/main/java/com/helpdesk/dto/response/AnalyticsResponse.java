package com.helpdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private Double averageResolutionTimeHours;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByDepartment;
    private Map<String, Long> ticketsByStatus;
    
    // New Analytics Fields
    private long totalStudents;
    private long totalAIQueries;
    private long manualQueries;
    private long pendingTickets;
    private double aiResolutionPercentage;
    private List<Map<String, Object>> mostAskedQuestions;
    private List<Map<String, Object>> dailyQueries;
    private List<Map<String, Object>> peakUsageHours;
    private List<Map<String, Object>> sentimentDistribution;
}
