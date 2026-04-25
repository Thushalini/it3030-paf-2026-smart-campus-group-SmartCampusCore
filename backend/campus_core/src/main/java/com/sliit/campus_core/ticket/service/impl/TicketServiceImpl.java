package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.NotificationRequestDTO;
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
import com.sliit.campus_core.ticket.exception.MaxAttachmentsExceededException;
import com.sliit.campus_core.ticket.exception.TicketNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

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

        String year = String.valueOf(Year.now().getValue());
        String prefix = "TKT-" + year + "-";

        // Query DB for the highest ticket number this year
        Optional<Ticket> lastTicket = ticketRepository
                .findFirstByTicketNumberStartingWithOrderByTicketNumberDesc(prefix);

        int nextSeq = 1;
        if (lastTicket.isPresent()) {
            String lastNum = lastTicket.get().getTicketNumber();
            try {
                String seqPart = lastNum.substring(lastNum.lastIndexOf('-') + 1);
                nextSeq = Integer.parseInt(seqPart) + 1;
            } catch (Exception e) {
                nextSeq = 1; // fallback
            }
        }

        String ticketNumber = prefix + String.format("%04d", nextSeq);
        ticket.setTicketNumber(ticketNumber);

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        ticket.setAssignedToId(null);
        ticket.setAssignedToName(null);
        ticket.setRejectionReason(null);
        ticket.setResolutionNote(null);
        ticket.setFirstResponseAt(null);
        ticket.setResolvedAt(null);
        ticket.setClosedAt(null);
        ticket.setFirstResponseTimeMinutes(null);
        ticket.setResolutionTimeMinutes(null);

        Ticket saved = ticketRepository.save(ticket);

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(reportedById);
        req.setType("TICKET");
        req.setTitle("New Ticket Created");
        req.setMessage(ticket.getTitle());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishTicketCreated(req);

        return ticketMapper.toResponseDTO(saved);
    }

    @Override
    public TicketResponseDTO addImageAttachments(String ticketId, List<String> urls) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getImageAttachments() == null) {
            ticket.setImageAttachments(new ArrayList<>());
        }

        if (ticket.getImageAttachments().size() + urls.size() > 3) {
            throw new MaxAttachmentsExceededException("Cannot upload more than 3 images");
        }

        ticket.getImageAttachments().addAll(urls);
        ticket.setUpdatedAt(Instant.now());

        Ticket saved = ticketRepository.save(ticket);
        return ticketMapper.toResponseDTO(saved);
    }

    @Override
    public TicketResponseDTO getTicketById(String ticketId,
                                           String currentUserId,
                                           String currentRole) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        Ticket ticket = ticketOpt.orElseThrow(() -> new TicketNotFoundException(ticketId));

        if ("USER".equalsIgnoreCase(currentRole) &&
            !ticket.getReportedById().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized access to ticket");
        }

        return ticketMapper.toResponseDTO(ticket);
    }

    @Override
    public Page<TicketResponseDTO> getMyTickets(TicketFilterRequestDTO filter, Pageable pageable) {
        Page<Ticket> page = ticketRepository.findByReportedByIdOrderByCreatedAtDesc(filter.getReportedById(), pageable);

        List<TicketResponseDTO> filtered = page.stream()
            .filter(t -> filter.getStatus() == null || t.getStatus() == filter.getStatus())
            .filter(t -> filter.getPriority() == null || t.getPriority() == filter.getPriority())
            .filter(t -> filter.getCategory() == null || t.getCategory() == filter.getCategory())
            .filter(t -> filter.getResourceId() == null || t.getResourceId().equals(filter.getResourceId()))
            .filter(t -> filter.getSearch() == null 
                || t.getTitle().toLowerCase().contains(filter.getSearch().toLowerCase()) 
                || t.getDescription().toLowerCase().contains(filter.getSearch().toLowerCase()))
            .map(ticketMapper::toResponseDTO)
            .toList();

        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    @Override
    public TicketResponseDTO updateTicketStatus(String ticketId, TicketUpdateStatusRequestDTO dto,
                                                String changedById, String changedByName, String changedByRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!TicketStatus.getAllowedTransitions(ticket.getStatus()).contains(dto.getNewStatus())) {
            throw new InvalidStatusTransitionException("Cannot transition from " + ticket.getStatus() + " to " + dto.getNewStatus());
        }

        // FIX: Capture fromStatus BEFORE mutating the ticket
        TicketStatus fromStatus = ticket.getStatus();

        ticket.setStatus(dto.getNewStatus());
        ticket.setUpdatedAt(Instant.now());

        if (dto.getNewStatus() == TicketStatus.IN_PROGRESS && ticket.getFirstResponseAt() == null) {
            LocalDateTime now = LocalDateTime.now();
            ticket.setFirstResponseAt(now);
            long minutes = Duration.between(ticket.getCreatedAt(), now.atZone(ZoneId.systemDefault()).toInstant()).toMinutes();
            ticket.setFirstResponseTimeMinutes(minutes);
        }
        if (dto.getNewStatus() == TicketStatus.RESOLVED) {
            LocalDateTime resolvedAt = LocalDateTime.now();
            ticket.setResolvedAt(resolvedAt);
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

        TicketStatusHistory history = TicketStatusHistory.builder()
                .ticketId(ticketId)
                .fromStatus(fromStatus.name())          // FIX: was ticket.getStatus().name() (already mutated)
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
        req.setType("TICKET");
        req.setTitle("Status Updated");
        req.setMessage("Ticket status changed to " + ticket.getStatus());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishStatusChanged(req);

        return ticketMapper.toResponseDTO(savedTicket);
    }

    @Override
    public TicketResponseDTO assignTechnician(String ticketId, TicketAssignRequestDTO dto,
                                              String adminId, String adminName, String adminRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!(ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS)) {
            throw new InvalidStatusTransitionException("Ticket must be OPEN or IN_PROGRESS to assign technician");
        }

        ticket.setAssignedToId(dto.getTechnicianId());
        ticket.setAssignedToName(dto.getTechnicianName());

        // NEW: Auto-transition OPEN → IN_PROGRESS when a technician is assigned
        TicketStatus previousStatus = ticket.getStatus();
        if (ticket.getStatus() == TicketStatus.OPEN) {
            // --- SLA RECORDING first response at ---
            LocalDateTime now = LocalDateTime.now();
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(now);
                long minutes = Duration.between(ticket.getCreatedAt(), 
                        now.atZone(ZoneId.systemDefault()).toInstant()).toMinutes();
                ticket.setFirstResponseTimeMinutes(minutes);
            }
            // ------------------------------
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            ticket.setUpdatedAt(Instant.now());

            TicketStatusHistory history = TicketStatusHistory.builder()
                    .ticketId(ticketId)
                    .fromStatus(previousStatus.name())
                    .toStatus(TicketStatus.IN_PROGRESS.name())
                    .changedById(adminId)
                    .changedByName(adminName)
                    .changedByRole(adminRole)
                    .note("Technician assigned: " + dto.getTechnicianName())
                    .changedAt(LocalDateTime.now())
                    .build();
            ticketStatusHistoryRepository.save(history);
        }

        Ticket saved = ticketRepository.save(ticket);

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(dto.getTechnicianId());
        req.setType("TICKET");
        req.setTitle("Technician Assigned");
        req.setMessage("Assigned to " + dto.getTechnicianName());
        req.setReferenceId(ticket.getId());
        req.setReferenceType("TICKET");
        notificationPublisher.publishTechnicianAssigned(req);

        return ticketMapper.toResponseDTO(saved);
    }

    @Override
    public Page<TicketResponseDTO> getAllTickets(TicketFilterRequestDTO filter,
                                                String currentUserId,
                                                String currentRole,
                                                Pageable pageable) {
        Page<Ticket> page = ticketRepository.findAll(pageable);

        List<Ticket> filtered = page.getContent().stream()
                .filter(t -> {
                    if ("TECHNICIAN".equalsIgnoreCase(currentRole)) {
                        return currentUserId != null && currentUserId.equals(t.getAssignedToId());
                    }
                    return true;
                })
                .filter(t -> filter.getStatus() == null || t.getStatus() == filter.getStatus())
                .filter(t -> filter.getPriority() == null || t.getPriority() == filter.getPriority())
                .filter(t -> filter.getCategory() == null || t.getCategory() == filter.getCategory())
                .filter(t -> filter.getResourceId() == null || filter.getResourceId().equals(t.getResourceId()))
                .toList();

        List<TicketResponseDTO> dtos = filtered.stream()
                .map(ticketMapper::toResponseDTO)
                .toList();

        return new PageImpl<>(dtos, pageable, dtos.size());
    }

    @Override
    public TicketAnalyticsDTO getTicketAnalytics() {
        TicketAnalyticsDTO dto = new TicketAnalyticsDTO();
        dto.setTotalTickets(ticketRepository.count());

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

        // TODO: implement average calculations with MongoDB aggregation
        dto.setAvgFirstResponseMinutes(0.0);
        dto.setAvgResolutionMinutes(0.0);
        dto.setSlaBreachRate(0.0);

        // TODO: integrate with Member 1’s resource API for top reported resources
        dto.setTopReportedResources(List.of());

        return dto;
    }

    @Override
    public Page<TicketResponseDTO> getTicketsByResource(String resourceId,
                                                        String currentUserId,
                                                        String currentRole,
                                                        Pageable pageable) {
        return ticketRepository.findByResourceId(resourceId, pageable)
                .map(ticketMapper::toResponseDTO);
    }

}