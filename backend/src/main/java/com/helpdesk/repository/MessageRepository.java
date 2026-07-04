package com.helpdesk.repository;

import com.helpdesk.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTicketIdOrderByTimestampAsc(Long ticketId);
    Page<Message> findByTicketId(Long ticketId, Pageable pageable);
    long countByTicketId(Long ticketId);
}
