package com.sliit.campus_core.dto.comment;

import lombok.Data;
import java.time.Instant;

@Data
public class CommentResponseDTO {
    private String id;
    private String ticketId;
    private String content;
    private String authorId;
    private String authorName;
    private String authorRole;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean isEdited;
    private Boolean canEdit;
    private Boolean canDelete;    
}
