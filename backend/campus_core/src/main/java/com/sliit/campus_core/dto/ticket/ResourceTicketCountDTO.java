package com.sliit.campus_core.dto.ticket;

import lombok.Data;

@Data
public class ResourceTicketCountDTO {
    private String resourceId;
    private String resourceName;
    private Long ticketCount;    
}
