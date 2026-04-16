package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class TicketResponseDTO {
    private String id;
    private String ticketNumber;
    private String title;
    private String location;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String reportedById;
    private String reportedByName;
    private String reportedByEmail;
    private ContactDetailsDTO contactDetails;
    private List<String> imageUrls;

    private Instant createdAt;
    private Instant updatedAt;

    // SLA fields
    private String slaFirstResponseDisplay;
    private String slaResolutionDisplay;
    private Boolean slaBreached;

    private Integer commentsCount;  
}
