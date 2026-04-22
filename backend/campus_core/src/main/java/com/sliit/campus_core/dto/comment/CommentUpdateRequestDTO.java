package com.sliit.campus_core.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentUpdateRequestDTO {
    @NotBlank
    @Size(max = 500)
    private String content;    
}
