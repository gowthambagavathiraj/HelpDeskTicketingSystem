package com.helpdesk.service;

import com.helpdesk.dto.request.DepartmentRequest;
import com.helpdesk.dto.response.AnalyticsResponse;
import com.helpdesk.dto.response.DepartmentResponse;
import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.entity.Department;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.AILogRepository;
import com.helpdesk.repository.DepartmentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final AILogRepository aiLogRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByDepartmentName(request.getDepartmentName())) {
            throw new BadRequestException("Department already exists: " + request.getDepartmentName());
        }
        Department dept = departmentRepository.save(
                Department.builder().departmentName(request.getDepartmentName()).build()
        );
        return DepartmentResponse.builder()
                .id(dept.getId())
                .departmentName(dept.getDepartmentName())
                .build();
    }

    public List<DepartmentResponse> listDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentResponse.builder()
                        .id(d.getId())
                        .departmentName(d.getDepartmentName())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        departmentRepository.delete(dept);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(ticketService::mapUserToResponse)
                .collect(Collectors.toList());
    }


    @Transactional
    public UserResponse updateUserRole(Long userId, User.Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(newRole);
        userRepository.save(user);
        return ticketService.mapUserToResponse(user);
    }

    @Transactional
    public UserResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return ticketService.mapUserToResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Prevent deleting the last admin
        if (user.getRole() == User.Role.ADMIN) {
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the last admin user");
            }
        }
        
        userRepository.delete(user);
    }

    public AnalyticsResponse getAnalytics() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(Ticket.Status.OPEN);
        long inProgress = ticketRepository.countByStatus(Ticket.Status.IN_PROGRESS);
        long resolved = ticketRepository.countByStatus(Ticket.Status.RESOLVED);
        long closed = ticketRepository.countByStatus(Ticket.Status.CLOSED);
        
        Double avgResolutionTime = ticketRepository.getAverageResolutionTimeInHours();

        Map<String, Long> byPriority = new HashMap<>();
        for (Ticket.Priority p : Ticket.Priority.values()) {
            byPriority.put(p.name(), ticketRepository.countByPriority(p));
        }

        Map<String, Long> byDepartment = new HashMap<>();
        ticketRepository.countByDepartment().forEach(row -> {
            String dept = (String) row.get("department");
            Long count = (Long) row.get("count");
            if (dept != null) byDepartment.put(dept, count);
        });

        Map<String, Long> byStatus = Map.of(
                "OPEN", open, "IN_PROGRESS", inProgress,
                "RESOLVED", resolved, "CLOSED", closed
        );

        // Fetch detailed metrics for the Student Helpdesk Agent
        long totalStudents = userRepository.countByRole(User.Role.USER);
        long totalAIQueries = aiLogRepository.countAllQueries();
        long queriesWithTickets = aiLogRepository.countQueriesWithTickets();
        
        double aiResolutionPercentage = 0.0;
        if (totalAIQueries > 0) {
            long aiResolved = totalAIQueries - queriesWithTickets;
            aiResolutionPercentage = Math.round(((double) aiResolved / totalAIQueries) * 100.0 * 10.0) / 10.0;
        }

        List<Map<String, Object>> mostAsked = aiLogRepository.getMostAskedQuestions(PageRequest.of(0, 5));
        List<Map<String, Object>> daily = aiLogRepository.getDailyQueryCounts(PageRequest.of(0, 10));
        List<Map<String, Object>> peakHours = aiLogRepository.getPeakUsageHours();
        List<Map<String, Object>> sentiment = aiLogRepository.getSentimentDistribution();

        return AnalyticsResponse.builder()
                .totalTickets(total)
                .openTickets(open)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .averageResolutionTimeHours(avgResolutionTime != null ? Math.round(avgResolutionTime * 10.0) / 10.0 : 0.0)
                .ticketsByPriority(byPriority)
                .ticketsByDepartment(byDepartment)
                .ticketsByStatus(byStatus)
                
                // Add new metrics
                .totalStudents(totalStudents)
                .totalAIQueries(totalAIQueries)
                .manualQueries(total)
                .pendingTickets(open + inProgress)
                .aiResolutionPercentage(aiResolutionPercentage)
                .mostAskedQuestions(mostAsked)
                .dailyQueries(daily)
                .peakUsageHours(peakHours)
                .sentimentDistribution(sentiment)
                .build();
    }
}
