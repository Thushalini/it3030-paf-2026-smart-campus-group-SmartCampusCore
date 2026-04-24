package com.sliit.campus_core.ticket.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ticket_status_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusHistory {

    @Id
    private String id;

    private String ticketId;
    private String fromStatus;
    private String toStatus;

    private String changedById;
    private String changedByName;
    private String changedByRole;

    private String note;
    private LocalDateTime changedAt;

}
