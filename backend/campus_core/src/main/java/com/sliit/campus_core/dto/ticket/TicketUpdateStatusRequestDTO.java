package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketUpdateStatusRequestDTO {
    @NotNull
    private TicketStatus newStatus;

    private String rejectionReason;
    private String resolutionNote;
    private String assignedToId;    
}
