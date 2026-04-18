package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.NotificationRequestDTO;
import com.sliit.campus_core.dto.ticket.ContactDetailsDTO;
import com.sliit.campus_core.dto.ticket.TicketAnalyticsDTO;
import com.sliit.campus_core.dto.ticket.TicketAssignRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketFilterRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.dto.ticket.TicketUpdateStatusRequestDTO;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.TicketStatusHistory;
import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
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
import java.util.Map;
import java.util.List;

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
        ticket.setResourceId(dto.getResourceId());
        ticket.setResourceName(dto.getResourceName());
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

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(reportedById);
        req.setType("TICKET_CREATED");
        req.setTitle("New Ticket Created");
        req.setMessage(ticket.getTitle());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishTicketCreated(req);

        return ticketMapper.toResponseDTO(saved);
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

        return ticketMapper.toResponseDTO(ticket);
    }

    @Override
    public Page<TicketResponseDTO> getMyTickets(String currentUserId, Pageable pageable) {
        return ticketRepository.findByReportedByIdOrderByCreatedAtDesc(currentUserId, pageable)
                .map(ticketMapper::toResponseDTO);
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

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(ticket.getReportedById());
        req.setType("TICKET_STATUS_CHANGED");
        req.setTitle("Status Updated");
        req.setMessage("Ticket status changed to " + ticket.getStatus());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishStatusChanged(req);

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

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(dto.getTechnicianId());
        req.setType("TICKET_ASSIGNED");
        req.setTitle("Technician Assigned");
        req.setMessage("Assigned to " + dto.getTechnicianName());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishTechnicianAssigned(req);

        return ticketMapper.toResponseDTO(ticket);
    }

    @Override
    public Page<TicketResponseDTO> getAllTickets(TicketFilterRequestDTO filter,
                                                String currentUserId,
                                                String currentRole,
                                                Pageable pageable) {
        // TODO: integrate with Member 4’s JWT claims for real userId/role
        if ("TECHNICIAN".equalsIgnoreCase(currentRole)) {
            filter.setAssignedToId(currentUserId);
        }

        // Build dynamic query (simplified for now)
        return ticketRepository.findAll(pageable)
                .map(this::toResponseDTO);
    }

    @Override
    public TicketAnalyticsDTO getTicketAnalytics() {
        TicketAnalyticsDTO dto = new TicketAnalyticsDTO();
        dto.setTotalTickets(ticketRepository.count());

        // Basic counts
        dto.setByStatus(Map.of(
                "OPEN", ticketRepository.countByStatus(TicketStatus.OPEN),
                "IN_PROGRESS", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
                "RESOLVED", ticketRepository.countByStatus(TicketStatus.RESOLVED),
                "CLOSED", ticketRepository.countByStatus(TicketStatus.CLOSED),
                "REJECTED", ticketRepository.countByStatus(TicketStatus.REJECTED)
        ));

        dto.setByPriority(Map.of(
                "HIGH", ticketRepository.countByPriority(TicketPriority.HIGH),
                "MEDIUM", ticketRepository.countByPriority(TicketPriority.MEDIUM),
                "LOW", ticketRepository.countByPriority(TicketPriority.LOW)
        ));

        dto.setByCategory(Map.of(
            "ELECTRICAL", ticketRepository.countByCategory(TicketCategory.ELECTRICAL),
            "PLUMBING", ticketRepository.countByCategory(TicketCategory.PLUMBING),
            "IT_EQUIPMENT", ticketRepository.countByCategory(TicketCategory.IT_EQUIPMENT),
            "FURNITURE", ticketRepository.countByCategory(TicketCategory.FURNITURE),
            "HVAC", ticketRepository.countByCategory(TicketCategory.HVAC),
            "SAFETY", ticketRepository.countByCategory(TicketCategory.SAFETY),
            "OTHER", ticketRepository.countByCategory(TicketCategory.OTHER)
        ));



        // TODO: compute averages with Mongo aggregation
        dto.setAvgFirstResponseMinutes(0.0);
        dto.setAvgResolutionMinutes(0.0);
        dto.setSlaBreachRate(0.0);

        // TODO: integrate with Member 1’s resource API for topReportedResources
        dto.setTopReportedResources(List.of());

        return dto;
    }

    @Override
    public Page<TicketResponseDTO> getTicketsByResource(String resourceId,
                                                        String currentUserId,
                                                        String currentRole,
                                                        Pageable pageable) {
        // TODO: confirm with Member 1 whether they poll this endpoint or you push updates
        return ticketRepository.findByResourceId(resourceId, pageable)
                .map(ticketMapper::toResponseDTO);
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
