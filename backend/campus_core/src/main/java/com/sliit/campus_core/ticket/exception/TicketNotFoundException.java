package com.sliit.campus_core.ticket.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String id) {
        super("Ticket not found with id: " + id);
    }
}
