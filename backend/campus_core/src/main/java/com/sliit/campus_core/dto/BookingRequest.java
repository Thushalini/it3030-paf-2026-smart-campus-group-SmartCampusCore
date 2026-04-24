package com.sliit.campus_core.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BookingRequest {
    
    @NotNull(message = "Resource ID is required")
    private String resourceId;
    
    @NotNull(message = "Date is required")
    @Future(message = "Date must be in the future")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must not exceed 500 characters")
    private String purpose;
    
    @NotNull(message = "Attendees count is required")
    @Min(value = 1, message = "Attendees count must be at least 1")
    @Max(value = 1000, message = "Attendees count must not exceed 1000")
    private Integer attendeesCount;
    
    public BookingRequest() {}
    
    public BookingRequest(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, 
                         String purpose, Integer attendeesCount) {
        this.resourceId = resourceId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.attendeesCount = attendeesCount;
    }
    
    public String getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public LocalTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    
    public Integer getAttendeesCount() {
        return attendeesCount;
    }
    
    public void setAttendeesCount(Integer attendeesCount) {
        this.attendeesCount = attendeesCount;
    }
}
