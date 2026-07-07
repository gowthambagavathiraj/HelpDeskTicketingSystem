package com.helpdesk.repository;

import com.helpdesk.entity.AILog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface AILogRepository extends JpaRepository<AILog, Long> {

    List<AILog> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    List<AILog> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT l FROM AILog l WHERE l.sessionId = :sessionId ORDER BY l.createdAt DESC")
    List<AILog> findRecentBySessionId(@Param("sessionId") String sessionId, Pageable pageable);

    @Query("SELECT COUNT(l) FROM AILog l")
    long countAllQueries();

    @Query("SELECT COUNT(l) FROM AILog l WHERE l.ticketCreated = true")
    long countQueriesWithTickets();

    @Query("SELECT l.question as question, COUNT(l) as count FROM AILog l GROUP BY l.question ORDER BY count DESC")
    List<Map<String, Object>> getMostAskedQuestions(Pageable pageable);

    @Query("SELECT DATE(l.createdAt) as date, COUNT(l) as count FROM AILog l GROUP BY DATE(l.createdAt) ORDER BY DATE(l.createdAt) DESC")
    List<Map<String, Object>> getDailyQueryCounts(Pageable pageable);

    @Query("SELECT HOUR(l.createdAt) as hour, COUNT(l) as count FROM AILog l GROUP BY HOUR(l.createdAt) ORDER BY count DESC")
    List<Map<String, Object>> getPeakUsageHours();

    @Query("SELECT l.sentiment as sentiment, COUNT(l) as count FROM AILog l GROUP BY l.sentiment")
    List<Map<String, Object>> getSentimentDistribution();
}
