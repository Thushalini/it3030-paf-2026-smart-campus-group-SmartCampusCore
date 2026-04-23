package com.sliit.campus_core.ticket.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
