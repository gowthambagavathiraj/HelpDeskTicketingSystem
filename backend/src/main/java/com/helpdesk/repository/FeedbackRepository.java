package com.helpdesk.repository;

import com.helpdesk.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(f.aiRating) as avgAiRating, AVG(f.staffRating) as avgStaffRating, AVG(f.overallRating) as avgOverallRating FROM Feedback f")
    Map<String, Double> getAverageRatings();
}
