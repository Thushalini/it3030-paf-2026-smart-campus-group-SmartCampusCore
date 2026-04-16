package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.ticket.ContactDetailsDTO;
import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import com.sliit.campus_core.ticket.repository.TicketRepository;
import com.sliit.campus_core.ticket.service.TicketService;
import com.sliit.campus_core.ticket.exception.TicketNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final AtomicInteger sequence = new AtomicInteger(1);

    @Autowired
    public TicketServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public TicketResponseDTO createTicket(TicketCreateRequestDTO dto,
                                        String reportedById,
                                        String reportedByName,
                                        String reportedByEmail) {
        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setLocation(dto.getLocation());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setContactDetails(dto.getContactDetails().toEntity());

        ticket.setReportedById(reportedById);
        ticket.setReportedByName(reportedByName);
        ticket.setReportedByEmail(reportedByEmail);

        String ticketNumber = "TKT-" + Year.now().getValue() + "-" +
                String.format("%04d", sequence.getAndIncrement());
        ticket.setTicketNumber(ticketNumber);

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        Ticket saved = ticketRepository.save(ticket);
        return toResponseDTO(saved);
    }

    @Override
    public TicketResponseDTO getTicketById(String ticketId,
                                           String currentUserId,
                                           String currentRole) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        Ticket ticket = ticketOpt.orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Basic role check (expand later)
        if ("USER".equalsIgnoreCase(currentRole) &&
            !ticket.getReportedById().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized access to ticket");
        }

        return toResponseDTO(ticket);
    }

    @Override
    public Page<TicketResponseDTO> getMyTickets(String currentUserId, Pageable pageable) {
        return ticketRepository.findByReportedByIdOrderByCreatedAtDesc(currentUserId, pageable)
                .map(this::toResponseDTO);
    }

    private TicketResponseDTO toResponseDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setTitle(ticket.getTitle());
        dto.setLocation(ticket.getLocation());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setReportedById(ticket.getReportedById());
        dto.setReportedByName(ticket.getReportedByName());
        dto.setReportedByEmail(ticket.getReportedByEmail());
        dto.setContactDetails(ContactDetailsDTO.fromEntity(ticket.getContactDetails()));
        dto.setImageUrls(ticket.getImageAttachments());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setCommentsCount(0);
        return dto;
    }
}
