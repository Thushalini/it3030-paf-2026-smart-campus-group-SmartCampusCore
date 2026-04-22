package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketFilterRequestDTO {
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private String resourceId;
    private String assignedToId;
    private String reportedById;
    private String search;
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDir = "DESC";    
}
