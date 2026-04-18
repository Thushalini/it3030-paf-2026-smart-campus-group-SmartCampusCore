package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.dto.NotificationRequestDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.TicketComment;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;


public interface NotificationPublisher {

    // Ticket events
    void publishTicketCreated(NotificationRequestDTO dto);
    void publishStatusChanged(NotificationRequestDTO dto);
    void publishTechnicianAssigned(NotificationRequestDTO dto);
    // Comment events
    void publishCommentAdded(NotificationRequestDTO dto);
    void publishCommentUpdated(NotificationRequestDTO dto);
    void publishCommentDeleted(NotificationRequestDTO dto);

    // TODO: add publishCommentAdded, publishCommentUpdated, publishCommentDeleted when Member 4 defines NotificationService
}
