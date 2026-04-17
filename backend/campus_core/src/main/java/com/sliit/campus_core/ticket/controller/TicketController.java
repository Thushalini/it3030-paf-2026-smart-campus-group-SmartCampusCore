package com.sliit.campus_core.ticket.controller;

import com.sliit.campus_core.dto.ApiResponse;
import com.sliit.campus_core.dto.ticket.TicketAnalyticsDTO;
import com.sliit.campus_core.dto.ticket.TicketAssignRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketFilterRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.dto.ticket.TicketUpdateStatusRequestDTO;
import com.sliit.campus_core.ticket.exception.MaxAttachmentsExceededException;
import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import com.sliit.campus_core.ticket.service.FileStorageService;
import com.sliit.campus_core.ticket.service.TicketService;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @Autowired
    private FileStorageService fileStorageService;

    // POST /api/v1/tickets → create a new ticket
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponseDTO>> createTicket(
            @Valid @RequestBody TicketCreateRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Stubbed user info for now (replace with SecurityContext later)
        String userId = "user123";
        String fullName = "Test User";
        String email = "test@example.com";

        TicketResponseDTO created = ticketService.createTicket(dto, userId, fullName, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", created));
    }

    // GET /api/v1/tickets/{id} → fetch single ticket
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> getTicketById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = "user123"; // stubbed
        String role = "USER";      // stubbed

        TicketResponseDTO ticket = ticketService.getTicketById(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched successfully", ticket));
    }

    // GET /api/v1/tickets/my → fetch current user's tickets
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<?>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        String userId = "user123"; // stubbed
        return ResponseEntity.ok(ApiResponse.success("My tickets fetched successfully",
                ticketService.getMyTickets(userId, pageable)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> updateStatus(@PathVariable String id,
            @Valid @RequestBody TicketUpdateStatusRequestDTO dto) {
        TicketResponseDTO response = ticketService.updateTicketStatus(id, dto,
                "dummyUserId", "Dummy User", "ROLE_ADMIN");
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", response));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> assignTechnician(@PathVariable String id,
            @Valid @RequestBody TicketAssignRequestDTO dto) {
        TicketResponseDTO response = ticketService.assignTechnician(id, dto, "dummyAdminId");
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", response));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadAttachments(
            @PathVariable String id,
            @RequestParam(required = false) MultiValueMap<String, MultipartFile> fileMap,
            HttpServletRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<MultipartFile> files = new ArrayList<>();
        List<Part> fileParts = new ArrayList<>();

        if (fileMap != null && !fileMap.isEmpty()) {
            fileMap.values().forEach(files::addAll);
        }

        if (files.isEmpty()) {
            try {
                if (request.getContentType() == null || !request.getContentType().toLowerCase().contains("multipart/form-data")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Request is not multipart/form-data. Ensure the request body is form-data with file fields.");
                }

                for (Part part : request.getParts()) {
                    if (part.getSubmittedFileName() != null && part.getSize() > 0) {
                        fileParts.add(part);
                    }
                }
            } catch (IOException | ServletException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unable to parse multipart file parts", ex);
            }
        }

        if (files.isEmpty() && fileParts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No files part found in the request. Use multipart/form-data with file fields.");
        }

        if (!files.isEmpty() && files.size() > 3) {
            throw new MaxAttachmentsExceededException("Cannot upload more than 3 images");
        }
        if (!fileParts.isEmpty() && fileParts.size() > 3) {
            throw new MaxAttachmentsExceededException("Cannot upload more than 3 images");
        }

        List<String> urls = new ArrayList<>();
        if (!files.isEmpty()) {
            urls.addAll(files.stream().map(fileStorageService::storeFile).toList());
        } else {
            fileParts.forEach(part -> urls.add(fileStorageService.storeFile(part)));
        }

        // TODO: update ticket entity with these URLs (ticketService method)
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", urls));
    }

    // GET /api/v1/tickets → admin/technician filtered list
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String resourceId,
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        // TODO: replace stubbed values with JWT claims
        String userId = "user123";
        String role = "ADMIN";

        TicketFilterRequestDTO filter = new TicketFilterRequestDTO();
        filter.setStatus(status);
        filter.setPriority(priority);
        filter.setCategory(category);
        filter.setResourceId(resourceId);

        return ResponseEntity.ok(ApiResponse.success("Tickets fetched successfully",
                ticketService.getAllTickets(filter, userId, role, pageable)));
    }

    // GET /api/v1/tickets/analytics → admin analytics
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<TicketAnalyticsDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched successfully",
                ticketService.getTicketAnalytics()));
    }

    // GET /api/v1/tickets/resource/{resourceId} → resource-based query
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<?>> getTicketsByResource(
            @PathVariable String resourceId,
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        String userId = "user123"; // TODO: replace with JWT claims
        String role = "TECHNICIAN"; // TODO: replace with JWT claims

        return ResponseEntity.ok(ApiResponse.success("Tickets by resource fetched successfully",
                ticketService.getTicketsByResource(resourceId, userId, role, pageable)));
    }

}
