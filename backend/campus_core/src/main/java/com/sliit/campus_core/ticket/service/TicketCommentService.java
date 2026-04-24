package com.sliit.campus_core.ticket.service;

import com.sliit.campus_core.dto.comment.CommentCreateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentUpdateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentResponseDTO;

import java.util.List;

public interface TicketCommentService {
    CommentResponseDTO addComment(String ticketId, CommentCreateRequestDTO dto,
                                  String authorId, String authorName, String authorRole);

    List<CommentResponseDTO> getCommentsByTicket(String ticketId, String currentUserId);

    CommentResponseDTO updateComment(String ticketId, String commentId,
                                     CommentUpdateRequestDTO dto, String currentUserId);

    void deleteComment(String ticketId, String commentId,
                       String currentUserId, String currentRole);    
}
