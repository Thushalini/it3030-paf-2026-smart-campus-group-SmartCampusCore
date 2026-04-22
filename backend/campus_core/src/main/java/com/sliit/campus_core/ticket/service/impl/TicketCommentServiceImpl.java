package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.NotificationRequestDTO;
import com.sliit.campus_core.dto.comment.CommentCreateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentUpdateRequestDTO;
import com.sliit.campus_core.dto.comment.CommentResponseDTO;
import com.sliit.campus_core.ticket.exception.CommentNotFoundException;
import com.sliit.campus_core.ticket.exception.UnauthorizedException;
import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.TicketComment;
import com.sliit.campus_core.ticket.repository.TicketCommentRepository;
import com.sliit.campus_core.ticket.repository.TicketRepository;
import com.sliit.campus_core.ticket.service.TicketCommentService;
import com.sliit.campus_core.ticket.service.NotificationPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketCommentServiceImpl implements TicketCommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    @Autowired
    public TicketCommentServiceImpl(TicketRepository ticketRepository,
                                    TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Override
    public CommentResponseDTO addComment(String ticketId, CommentCreateRequestDTO dto,
                                         String authorId, String authorName, String authorRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new CommentNotFoundException("Ticket not found"));

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setContent(dto.getContent());
        comment.setAuthorId(authorId);
        comment.setAuthorName(authorName);
        comment.setAuthorRole(authorRole);
        comment.setCreatedAt(Instant.now());
        comment.setEdited(false);
        comment.setDeleted(false);

        TicketComment saved = commentRepository.save(comment);

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(ticket.getReportedById());
        req.setType("COMMENT_ADDED");
        req.setTitle("New Comment");
        req.setMessage(comment.getContent());
        req.setReferenceId(comment.getId());
        req.setReferenceType("COMMENT");
        notificationPublisher.publishCommentAdded(req);

        // TODO: replace with publishCommentAdded when Member 4 defines NotificationService

        return toResponse(saved, authorId, authorRole);
    }

    @Override
    public List<CommentResponseDTO> getCommentsByTicket(String ticketId, String currentUserId) {
        List<TicketComment> comments = commentRepository
                .findByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(ticketId);

        return comments.stream()
                .map(c -> toResponse(c, currentUserId, null))
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponseDTO updateComment(String ticketId, String commentId,
                                            CommentUpdateRequestDTO dto, String currentUserId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new UnauthorizedException("You cannot edit another user's comment");
        }

        comment.setContent(dto.getContent());
        comment.setEdited(true);
        comment.setUpdatedAt(Instant.now());

        TicketComment updated = commentRepository.save(comment);

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(comment.getAuthorId());
        req.setType("COMMENT_UPDATED");
        req.setTitle("Comment Updated");
        req.setMessage(comment.getContent());
        req.setReferenceId(comment.getId());
        req.setReferenceType("COMMENT");
        notificationPublisher.publishCommentUpdated(req);

        // TODO: publishCommentUpdated when Member 4 defines NotificationService

        return toResponse(updated, currentUserId, null);
    }

    @Override
    public void deleteComment(String ticketId, String commentId,
                              String currentUserId, String currentRole) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (!"ADMIN".equals(currentRole) && !comment.getAuthorId().equals(currentUserId)) {
            throw new UnauthorizedException("You cannot delete another user's comment");
        }

        comment.setDeleted(true);
        comment.setContent("[deleted]");
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);

        NotificationRequestDTO req = new NotificationRequestDTO();
        req.setRecipientUserId(comment.getAuthorId());
        req.setType("COMMENT_DELETED");
        req.setTitle("Comment Deleted");
        req.setMessage("[deleted]");
        req.setReferenceId(comment.getId());
        req.setReferenceType("COMMENT");
        notificationPublisher.publishCommentDeleted(req);

        // TODO: publishCommentDeleted when Member 4 defines NotificationService

    }

    private CommentResponseDTO toResponse(TicketComment comment, String currentUserId, String currentRole) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setContent(comment.getContent());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorRole(comment.getAuthorRole());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setIsEdited(comment.isEdited());
        dto.setCanEdit(comment.getAuthorId().equals(currentUserId));
        dto.setCanDelete("ADMIN".equals(currentRole) || comment.getAuthorId().equals(currentUserId));
        return dto;
    }
}

