package com.sliit.campus_core.dto;

import java.time.LocalDateTime;

public record NotificationWithEmail(
    String id,
    String userId,
    String userEmail,
    String message,
    String type,
    boolean isRead,
    LocalDateTime createdAt
) {}