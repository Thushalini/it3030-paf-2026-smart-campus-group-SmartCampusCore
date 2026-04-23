package com.sliit.campus_core.ticket.model;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Data
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

    @Field("assigned_to_id")
    private String assignedToId;
    @Field("assigned_to_name")
    private String assignedToName;

    private ContactDetails contactDetails;

    private List<String> imageAttachments; // max 3
    @Field("rejection_reason")
    private String rejectionReason;
    @Field("resolution_note")
    private String resolutionNote;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Field("first_response_at")
    private LocalDateTime firstResponseAt;
    @Field("resolved_at")
    private LocalDateTime resolvedAt;
    @Field("closed_at")
    private LocalDateTime closedAt;

    @Field("first_response_time_minutes")
    private Long firstResponseTimeMinutes;
    @Field("resolution_time_minutes")
    private Long resolutionTimeMinutes;
}
