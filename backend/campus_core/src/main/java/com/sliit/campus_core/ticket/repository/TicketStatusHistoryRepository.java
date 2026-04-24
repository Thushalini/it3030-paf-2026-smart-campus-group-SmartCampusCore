package com.sliit.campus_core.ticket.repository;

import com.sliit.campus_core.ticket.model.TicketStatusHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketStatusHistoryRepository extends MongoRepository<TicketStatusHistory, String> {
    List<TicketStatusHistory> findByTicketIdOrderByChangedAtAsc(String ticketId);
}
