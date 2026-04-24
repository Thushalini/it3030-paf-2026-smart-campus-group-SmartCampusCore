package com.sliit.campus_core.ticket.repository;

import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    Page<Ticket> findByReportedByIdOrderByCreatedAtDesc(String reportedById, Pageable pageable);
    Page<Ticket> findByAssignedToIdAndStatusIn(String techId, List<TicketStatus> statuses, Pageable pageable);
    List<Ticket> findByResourceId(String resourceId);
    Page<Ticket> findByResourceId(String resourceId, Pageable pageable);
    Long countByStatus(TicketStatus status);
    Long countByPriority(TicketPriority priority);
    Long countByCategory(TicketCategory category);
    Page<Ticket> findByStatusAndPriorityOrderByCreatedAtAsc(TicketStatus status, TicketPriority priority, Pageable pageable);
    Boolean existsByResourceIdAndStatusIn(String resourceId, List<TicketStatus> statuses);
    Optional<Ticket> findFirstByTicketNumberStartingWithOrderByTicketNumberDesc(String prefix);
}
