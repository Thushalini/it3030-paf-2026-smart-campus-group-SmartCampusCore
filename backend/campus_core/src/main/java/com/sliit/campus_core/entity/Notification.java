package com.sliit.campus_core.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String message;
    private String type;   // "BOOKING", "TICKET", "COMMENT"

    @JsonProperty("isRead") 
    private boolean isRead;
    private LocalDateTime createdAt;

    private String userId; // store reference manually

    // Getters & Setters
    public String getId() { return id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    @JsonProperty("isRead") 
    public boolean isRead() { return isRead; }
    public void setisRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}