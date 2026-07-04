package com.helpdesk.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
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
}
