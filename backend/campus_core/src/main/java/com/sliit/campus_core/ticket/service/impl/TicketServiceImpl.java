package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.ticket.ContactDetailsDTO;
import com.sliit.campus_core.dto.ticket.TicketAssignRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.dto.ticket.TicketUpdateStatusRequestDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.TicketStatusHistory;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import com.sliit.campus_core.ticket.repository.TicketRepository;
import com.sliit.campus_core.ticket.repository.TicketStatusHistoryRepository;
import com.sliit.campus_core.ticket.mapper.TicketMapper;
import com.sliit.campus_core.ticket.service.NotificationPublisher;
import com.sliit.campus_core.ticket.service.TicketService;
import com.sliit.campus_core.ticket.exception.InvalidStatusTransitionException;
import com.sliit.campus_core.ticket.exception.TicketNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final AtomicInteger sequence = new AtomicInteger(1);

    @Autowired
private TicketStatusHistoryRepository ticketStatusHistoryRepository;

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Autowired
    private TicketMapper ticketMapper;

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

    @Override
    public TicketResponseDTO updateTicketStatus(String ticketId, TicketUpdateStatusRequestDTO dto,
                                                String changedById, String changedByName, String changedByRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Validate transition
        if (!TicketStatus.getAllowedTransitions(ticket.getStatus()).contains(dto.getNewStatus())) {
            throw new InvalidStatusTransitionException("Cannot transition from " + ticket.getStatus() + " to " + dto.getNewStatus());
        }

        // Apply new status first so transition-specific logic knows the target state
        ticket.setStatus(dto.getNewStatus());
        ticket.setUpdatedAt(Instant.now());

        // Handle transitions
        if (dto.getNewStatus() == TicketStatus.IN_PROGRESS && ticket.getFirstResponseAt() == null) {
            LocalDateTime now = LocalDateTime.now();
            ticket.setFirstResponseAt(now);
            // Calculate minutes between creation and first response
            long minutes = Duration.between(ticket.getCreatedAt(), now.atZone(ZoneId.systemDefault()).toInstant()).toMinutes();
            ticket.setFirstResponseTimeMinutes(minutes);
        }
        if (dto.getNewStatus() == TicketStatus.RESOLVED) {
            LocalDateTime resolvedAt = LocalDateTime.now();
            ticket.setResolvedAt(resolvedAt);
            // Calculate minutes between creation and resolution
            long minutes = Duration.between(ticket.getCreatedAt(), resolvedAt.atZone(ZoneId.systemDefault()).toInstant()).toMinutes();
            ticket.setResolutionTimeMinutes(minutes);
            ticket.setResolutionNote(dto.getResolutionNote());
        }
        if (dto.getNewStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        if (dto.getNewStatus() == TicketStatus.REJECTED) {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank()) {
                throw new InvalidStatusTransitionException("Rejection reason required");
            }
            ticket.setRejectionReason(dto.getRejectionReason());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Save status history using builder
        TicketStatusHistory history = TicketStatusHistory.builder()
                .ticketId(ticketId)
                .fromStatus(ticket.getStatus().name())
                .toStatus(dto.getNewStatus().name())
                .changedById(changedById)
                .changedByName(changedByName)
                .changedByRole(changedByRole)
                .note(dto.getResolutionNote() != null ? dto.getResolutionNote() : dto.getRejectionReason())
                .changedAt(LocalDateTime.now())
                .build();

        ticketStatusHistoryRepository.save(history);

        notificationPublisher.publishStatusChanged(savedTicket, savedTicket.getStatus());

        return ticketMapper.toResponseDTO(savedTicket);
    }

    @Override
    public TicketResponseDTO assignTechnician(String ticketId, TicketAssignRequestDTO dto, String adminId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!(ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS)) {
            throw new InvalidStatusTransitionException("Ticket must be OPEN or IN_PROGRESS to assign technician");
        }

        ticket.setAssignedToId(dto.getTechnicianId());
        ticket.setAssignedToName(dto.getTechnicianName());
        ticketRepository.save(ticket);

        notificationPublisher.publishTechnicianAssigned(ticket);

        return ticketMapper.toResponseDTO(ticket);
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
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setFirstResponseTimeMinutes(ticket.getFirstResponseTimeMinutes());
        dto.setCommentsCount(0);
        return dto;
    }
}
