package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByCreatedBy(User user, Pageable pageable);
    Page<Ticket> findByAssignedTo(User user, Pageable pageable);
    Page<Ticket> findByDepartmentId(Long departmentId, Pageable pageable);
    Page<Ticket> findByStatus(Ticket.Status status, Pageable pageable);

    long countByStatus(Ticket.Status status);
    long countByPriority(Ticket.Priority priority);
    long countByDepartmentId(Long departmentId);

    @Query("SELECT t.status AS status, COUNT(t) AS count FROM Ticket t GROUP BY t.status")
    List<Map<String, Object>> countByStatusGrouped();

    @Query("SELECT t.priority AS priority, COUNT(t) AS count FROM Ticket t GROUP BY t.priority")
    List<Map<String, Object>> countByPriorityGrouped();

    @Query("SELECT d.departmentName AS department, COUNT(t) AS count FROM Ticket t JOIN t.department d GROUP BY d.departmentName")
    List<Map<String, Object>> countByDepartment();

    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, t.createdAt, t.closedAt)) FROM Ticket t WHERE t.closedAt IS NOT NULL")
    Double getAverageResolutionTimeInHours();

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:departmentId IS NULL OR t.department.id = :departmentId)")
    Page<Ticket> searchTickets(
            @Param("keyword") String keyword,
            @Param("status") Ticket.Status status,
            @Param("priority") Ticket.Priority priority,
            @Param("departmentId") Long departmentId,
            Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.createdBy = :user AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR t.status = :status)")
    Page<Ticket> searchTicketsByUser(
            @Param("user") User user,
            @Param("keyword") String keyword,
            @Param("status") Ticket.Status status,
            Pageable pageable);
}
