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
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.UserRepository;
import jakarta.validation.Valid;
import com.sliit.campus_core.entity.Role;  // adjust package if different
import java.util.stream.Collectors;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/tickets")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
               RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS}
)
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    // ========== INNER DTO FOR TECHNICIAN LIST ==========
    private static class TechnicianDTO {
        private final String id;
        private final String fullName;
        private final String email;

        public TechnicianDTO(String id, String fullName, String email) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
        }

        public String getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
    }
    // ========== END INNER DTO ==========
    
    // Helper to get User entity from authenticated email (JWT principal)
    private User getUserByEmail(String email) {
        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponseDTO>> createTicket(
            @Valid @RequestBody TicketCreateRequestDTO dto,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        TicketResponseDTO created = ticketService.createTicket(dto,
                currentUser.getId(), currentUser.getName(), currentUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> getTicketById(
            @PathVariable String id,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        TicketResponseDTO ticket = ticketService.getTicketById(id, currentUser.getId(), currentUser.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched successfully", ticket));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<?>> getMyTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal String email,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        User currentUser = getUserByEmail(email);

        TicketFilterRequestDTO filter = new TicketFilterRequestDTO();
        filter.setStatus(status);
        filter.setPriority(priority);
        filter.setCategory(category);
        filter.setResourceId(resourceId);
        filter.setSearch(search);
        filter.setReportedById(currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success("My tickets fetched successfully",
                ticketService.getMyTickets(filter, pageable)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketUpdateStatusRequestDTO dto,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        TicketResponseDTO response = ticketService.updateTicketStatus(id, dto,
                currentUser.getId(), currentUser.getName(), currentUser.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", response));
    }


    // ========== NEW ENDPOINT: FETCH ALL TECHNICIANS ==========
    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<TechnicianDTO>>> getTechnicians() {
        List<User> technicians = userRepository.findByRole(Role.TECHNICIAN);
        List<TechnicianDTO> dtos = technicians.stream()
                .map(user -> new TechnicianDTO(user.getId(), user.getName(), user.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Technicians fetched successfully", dtos));
    }
    // ========== END NEW ENDPOINT ==========

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody TicketAssignRequestDTO dto,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        // CHANGE: Pass name and role so service can log history on auto-transition
        TicketResponseDTO response = ticketService.assignTechnician(
                id, dto, currentUser.getId(), currentUser.getName(), currentUser.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", response));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadAttachments(
            @PathVariable String id,
            @RequestParam(required = false) MultiValueMap<String, MultipartFile> fileMap,
            HttpServletRequest request,
            @AuthenticationPrincipal String email) {  // email not used for attachments but kept for consistency

        // Attachments don't need user info except for logging – keep as is
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

        TicketResponseDTO updated = ticketService.addImageAttachments(id, urls);
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", updated));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String resourceId,
            @AuthenticationPrincipal String email,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        User currentUser = getUserByEmail(email);
        TicketFilterRequestDTO filter = new TicketFilterRequestDTO();
        filter.setStatus(status);
        filter.setPriority(priority);
        filter.setCategory(category);
        filter.setResourceId(resourceId);

        return ResponseEntity.ok(ApiResponse.success("Tickets fetched successfully",
                ticketService.getAllTickets(filter, currentUser.getId(), currentUser.getRole().name(), pageable)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<TicketAnalyticsDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched successfully",
                ticketService.getTicketAnalytics()));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<?>> getTicketsByResource(
            @PathVariable String resourceId,
            @AuthenticationPrincipal String email,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        User currentUser = getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Tickets by resource fetched successfully",
                ticketService.getTicketsByResource(resourceId, currentUser.getId(), currentUser.getRole().name(), pageable)));
    }
}