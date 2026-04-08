package com.sliit.campus_core.ticket.model.enums;

import java.util.*;

public enum TicketStatus {

    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED;

    private static final Map<TicketStatus, List<TicketStatus>> allowedTransitions = new HashMap<>();

    static {
        allowedTransitions.put(OPEN, Arrays.asList(IN_PROGRESS, REJECTED));
        allowedTransitions.put(IN_PROGRESS, Arrays.asList(RESOLVED, REJECTED));
        allowedTransitions.put(RESOLVED, Arrays.asList(CLOSED, IN_PROGRESS));
        allowedTransitions.put(CLOSED, Collections.emptyList());
        allowedTransitions.put(REJECTED, Collections.emptyList());
    }

    public static List<TicketStatus> getAllowedTransitions(TicketStatus fromStatus) {
        return allowedTransitions.getOrDefault(fromStatus, Collections.emptyList());
    }

}
