package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.dto.ticket.SLATargetDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Service 
public class SLAService {

    public SLATargetDTO computeSLATarget(TicketPriority priority) {
        switch (priority) {
            case CRITICAL:
                return new SLATargetDTO(60, 240); // 1 hour for first response, 4 hours for resolution
            case HIGH:
                return new SLATargetDTO(240, 1440); // 4 hours for first response, 24 hours for resolution
            case MEDIUM:
                return new SLATargetDTO(480, 2880); // 8 hours for first response, 48 hours for resolution
            case LOW:
                return new SLATargetDTO(1440, 7200); // 24 hours for first response, 5 days (120 hours) for resolution
            default:
                return new SLATargetDTO(0, 0);
        }
    }

    public boolean isSLABreached(Ticket ticket) {
        SLATargetDTO target = computeSLATarget(ticket.getPriority());
        if (ticket.getFirstResponseTimeMinutes() != null &&
            ticket.getFirstResponseTimeMinutes() > target.getFirstResponseTargetMinutes()) {
            return true;
        }
        if (ticket.getResolutionTimeMinutes() != null &&
            ticket.getResolutionTimeMinutes() > target.getResolutionTargetMinutes()) {
            return true;
        }
        return false;
    }

    public String formatDuration(Long minutes) {
        if (minutes == null) return "-";
        Duration d = Duration.of(minutes, ChronoUnit.MINUTES);
        long hours = d.toHours();
        long mins = d.toMinutes() % 60;
        return hours > 0 ? hours + " hours " + mins + " minutes" : mins + " minutes";
    }
}
