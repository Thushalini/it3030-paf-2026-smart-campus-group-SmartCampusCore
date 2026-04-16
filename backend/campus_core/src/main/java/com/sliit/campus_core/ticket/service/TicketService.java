package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    TicketResponseDTO createTicket(TicketCreateRequestDTO dto,
                                   String reportedById,
                                   String reportedByName,
                                   String reportedByEmail);

    TicketResponseDTO getTicketById(String ticketId,
                                    String currentUserId,
                                    String currentRole);

    Page<TicketResponseDTO> getMyTickets(String currentUserId, Pageable pageable);    
}
