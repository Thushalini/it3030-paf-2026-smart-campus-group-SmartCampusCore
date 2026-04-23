package com.sliit.campus_core.ticket.repository;

import com.sliit.campus_core.ticket.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface  TicketCommentRepository extends MongoRepository<TicketComment, String> {
    List<TicketComment> findByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(String ticketId);
    Long countByTicketId(String ticketId);
    List<TicketComment> findByTicketIdAndAuthorId(String ticketId, String authorId);
}