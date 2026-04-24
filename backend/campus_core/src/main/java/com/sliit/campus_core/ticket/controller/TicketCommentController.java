package com.sliit.campus_core.ticket.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.dto.ApiResponse;
import com.sliit.campus_core.dto.comment.CommentCreateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentResponseDTO;
import com.sliit.campus_core.dto.comment.CommentUpdateRequestDTO;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.ticket.service.TicketCommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    @Autowired
    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    @Autowired
    private UserRepository userRepository;

    private User getUserByEmail(String email) {
        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponseDTO>> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentCreateRequestDTO dto,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        CommentResponseDTO response = commentService.addComment(ticketId, dto,
                currentUser.getId(), currentUser.getName(), currentUser.getRole().name());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getComments(
            @PathVariable String ticketId,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        List<CommentResponseDTO> comments = commentService.getCommentsByTicket(ticketId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", comments));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentUpdateRequestDTO dto,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        CommentResponseDTO response = commentService.updateComment(ticketId, commentId, dto, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @AuthenticationPrincipal String email) {

        User currentUser = getUserByEmail(email);
        commentService.deleteComment(ticketId, commentId, currentUser.getId(), currentUser.getRole().name());
        return ResponseEntity.noContent().build();
    }
}