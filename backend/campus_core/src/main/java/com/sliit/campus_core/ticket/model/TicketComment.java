package com.sliit.campus_core.ticket.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "ticket_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    @Id
    private String id;

    private String ticketId;
    private String content;

    private String authorId;
    private String authorName;
    private String authorRole;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    private boolean isEdited;
    private boolean isDeleted;

}
