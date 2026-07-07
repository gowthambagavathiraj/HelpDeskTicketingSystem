package com.helpdesk.repository;

import com.helpdesk.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByCategory(String category);

    @Query("SELECT f FROM Faq f WHERE LOWER(f.question) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.answer) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faq> searchFaqs(@Param("query") String query);

    @Query("SELECT DISTINCT f.category FROM Faq f")
    List<String> findDistinctCategories();
}
