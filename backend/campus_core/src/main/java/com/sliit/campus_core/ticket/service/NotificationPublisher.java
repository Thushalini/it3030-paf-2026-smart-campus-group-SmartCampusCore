package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import org.springframework.stereotype.Service;

@Service
public class NotificationPublisher {
    public void publishTicketCreated(Ticket ticket) {
        System.out.println("Stub: Ticket created " + ticket.getId());
    }
    public void publishStatusChanged(Ticket ticket, TicketStatus oldStatus) {
        System.out.println("Stub: Status changed for " + ticket.getId() + " from " + oldStatus + " to " + ticket.getStatus());
    }
    public void publishTechnicianAssigned(Ticket ticket) {
        System.out.println("Stub: Technician assigned for " + ticket.getId());
    }    
}
