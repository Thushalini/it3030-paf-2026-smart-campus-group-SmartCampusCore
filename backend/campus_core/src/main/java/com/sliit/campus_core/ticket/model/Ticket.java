package com.sliit.campus_core.ticket.model;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    private String id;

    @Indexed(unique = true)
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

    private String assignedToId;
    private String assignedToName;

    private ContactDetails contactDetails;

    private List<String> imageAttachments; // max 3
    private String rejectionReason;
    private String resolutionNote;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    private Long firstResponseTimeMinutes;
    private Long resolutionTimeMinutes;
}
