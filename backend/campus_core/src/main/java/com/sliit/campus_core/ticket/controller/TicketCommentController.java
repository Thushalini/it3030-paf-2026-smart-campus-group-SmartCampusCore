package com.sliit.campus_core.ticket.controller;

import com.sliit.campus_core.dto.ApiResponse;
import com.sliit.campus_core.dto.comment.CommentCreateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentUpdateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentResponseDTO;
import com.sliit.campus_core.ticket.service.TicketCommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class TicketCommentController {
    private final TicketCommentService commentService;

    @Autowired
    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponseDTO>> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentCreateRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        CommentResponseDTO response = commentService.addComment(ticketId, dto,
                "user123", "Test User", "USER");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getComments(
            @PathVariable String ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<CommentResponseDTO> comments = commentService.getCommentsByTicket(ticketId, "user123");
        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", comments));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentUpdateRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        CommentResponseDTO response = commentService.updateComment(ticketId, commentId, dto, "user123");
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        commentService.deleteComment(ticketId, commentId, "user123", "USER");
        return ResponseEntity.noContent().build();
    }    
}
