package com.sliit.campus_core.dto.ticket;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponseDTO {
    private String id;
    private String ticketNumber;
    private String title;
    private String resourceId;
    private String resourceName;
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

    private String assignedToId;
    private String assignedToName;

    private Instant createdAt;
    private Instant updatedAt;

    // SLA fields
    private String slaFirstResponseDisplay;
    private String slaResolutionDisplay;
    private Boolean slaBreached;

    @JsonProperty("firstResponseAt")
    private LocalDateTime firstResponseAt;
    
    @JsonProperty("firstResponseTimeMinutes")
    private Long firstResponseTimeMinutes;

    private LocalDateTime resolvedAt;
    private Long resolutionTimeMinutes;
    private String resolutionNote;
    private String rejectionReason;

    private Integer commentsCount;  
}
