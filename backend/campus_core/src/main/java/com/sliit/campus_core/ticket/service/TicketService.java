package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketFilterRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.dto.ticket.TicketUpdateStatusRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketAnalyticsDTO;
import com.sliit.campus_core.dto.ticket.TicketAssignRequestDTO;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    TicketResponseDTO createTicket(TicketCreateRequestDTO dto,
                                   String reportedById,
                                   String reportedByName,
                                   String reportedByEmail);

    TicketResponseDTO addImageAttachments(String ticketId, List<String> urls);
    
    TicketResponseDTO getTicketById(String ticketId,
                                    String currentUserId,
                                    String currentRole);

    Page<TicketResponseDTO> getMyTickets(TicketFilterRequestDTO filter, Pageable pageable);

    TicketResponseDTO updateTicketStatus(String ticketId,
                                         TicketUpdateStatusRequestDTO dto,
                                         String changedById,
                                         String changedByName,
                                         String changedByRole);

    TicketResponseDTO assignTechnician(String ticketId,
                                       TicketAssignRequestDTO dto,
                                       String adminId);
    
    Page<TicketResponseDTO> getAllTickets(TicketFilterRequestDTO filter,
                                      String currentUserId,
                                      String currentRole,
                                      Pageable pageable);

    TicketAnalyticsDTO getTicketAnalytics();

    Page<TicketResponseDTO> getTicketsByResource(String resourceId,
                                                String currentUserId,
                                                String currentRole,
                                                Pageable pageable);

}
