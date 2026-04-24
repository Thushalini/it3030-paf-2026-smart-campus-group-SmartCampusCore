package com.sliit.campus_core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectionRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;

    public String getReason() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
