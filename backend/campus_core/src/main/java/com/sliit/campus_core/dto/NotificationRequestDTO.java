package com.sliit.campus_core.dto;

import lombok.Data;

@Data
public class NotificationRequestDTO {
    private String recipientUserId;
    private String type;
    private String title;
    private String message;
    private String referenceId;
    private String referenceType;    
}
