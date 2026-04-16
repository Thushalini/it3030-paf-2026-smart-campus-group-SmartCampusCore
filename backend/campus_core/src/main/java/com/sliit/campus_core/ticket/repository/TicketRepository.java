package com.sliit.campus_core.ticket.repository;

import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
public interface TicketRepository extends MongoRepository<Ticket, String> {
    Page<Ticket> findByReportedByIdOrderByCreatedAtDesc(String reportedById, Pageable pageable);
    Page<Ticket> findByAssignedToIdAndStatusIn(String techId, List<TicketStatus> statuses, Pageable pageable);
    List<Ticket> findByResourceId(String resourceId);
    Long countByStatus(TicketStatus status);
    Page<Ticket> findByStatusAndPriorityOrderByCreatedAtAsc(TicketStatus status, TicketPriority priority, Pageable pageable);
    Boolean existsByResourceIdAndStatusIn(String resourceId, List<TicketStatus> statuses);
}
