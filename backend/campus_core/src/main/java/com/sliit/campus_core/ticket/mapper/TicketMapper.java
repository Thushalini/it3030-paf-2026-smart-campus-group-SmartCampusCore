package com.sliit.campus_core.ticket.mapper;

import com.sliit.campus_core.dto.ticket.ContactDetailsDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.service.SLAService;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    private final SLAService slaService;

    // Constructor injection – Spring will provide the SLAService bean
    public TicketMapper(SLAService slaService) {
        this.slaService = slaService;
    }

    public TicketResponseDTO toResponseDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setTitle(ticket.getTitle());
        dto.setResourceId(ticket.getResourceId());
        dto.setResourceName(ticket.getResourceName());
        dto.setLocation(ticket.getLocation());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setReportedById(ticket.getReportedById());
        dto.setReportedByName(ticket.getReportedByName());
        dto.setReportedByEmail(ticket.getReportedByEmail());
        dto.setAssignedToId(ticket.getAssignedToId());
        dto.setAssignedToName(ticket.getAssignedToName());
        dto.setContactDetails(ContactDetailsDTO.fromEntity(ticket.getContactDetails()));
        dto.setImageUrls(ticket.getImageAttachments());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setFirstResponseTimeMinutes(ticket.getFirstResponseTimeMinutes());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setResolutionTimeMinutes(ticket.getResolutionTimeMinutes());
        dto.setResolutionNote(ticket.getResolutionNote());
        dto.setRejectionReason(ticket.getRejectionReason());

        // Calculate SLA display strings (formatting only)
        dto.setSlaFirstResponseDisplay(formatDuration(ticket.getFirstResponseTimeMinutes()));
        dto.setSlaResolutionDisplay(formatDuration(ticket.getResolutionTimeMinutes()));

        // Use SLAService to determine if SLA is breached (per‑priority)
        dto.setSlaBreached(slaService.isSLABreached(ticket));

        dto.setCommentsCount(0);
        return dto;
    }

    private String formatDuration(Long minutes) {
        if (minutes == null) return null;
        long hours = minutes / 60;
        long mins = minutes % 60;
        if (hours > 0) {
            return hours + "h " + mins + "m";
        } else {
            return mins + "m";
        }
    }
}