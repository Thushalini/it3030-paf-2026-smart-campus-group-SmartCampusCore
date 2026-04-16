package com.sliit.campus_core.ticket.controller;

import com.sliit.campus_core.dto.ApiResponse;
import com.sliit.campus_core.dto.ticket.TicketCreateRequestDTO;
import com.sliit.campus_core.dto.ticket.TicketResponseDTO;
import com.sliit.campus_core.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

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
}
