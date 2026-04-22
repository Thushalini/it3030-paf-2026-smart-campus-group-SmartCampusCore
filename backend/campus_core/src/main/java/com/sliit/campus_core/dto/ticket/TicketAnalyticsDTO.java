package com.sliit.campus_core.dto.ticket;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class TicketAnalyticsDTO {
    private Long totalTickets;
    private Map<String, Long> byStatus;
    private Map<String, Long> byCategory;
    private Map<String, Long> byPriority;
    private Double avgFirstResponseMinutes;
    private Double avgResolutionMinutes;
    private Double slaBreachRate;
    private List<ResourceTicketCountDTO> topReportedResources;    
}
