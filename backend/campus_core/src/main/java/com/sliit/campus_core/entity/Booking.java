package com.sliit.campus_core.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    
    @DBRef(lazy = false)
    @Field("resource")
    private Resource resource;
    
    @DBRef(lazy = false)
    @Field("user")
    private User user;
    
    private LocalDate date;
    
    @Field("start_time")
    private LocalTime startTime;
    
    @Field("end_time")
    private LocalTime endTime;
    
    private String purpose;
    
    @Field("attendees_count")
    private Integer attendeesCount;
    
    private BookingStatus status;
    
    @Field("rejection_reason")
    private String rejectionReason;
    
    @Field("qr_code")
    private byte[] qrCode;
    
    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    
    public Booking() {}
    
    public Booking(Resource resource, User user, LocalDate date, LocalTime startTime, 
                   LocalTime endTime, String purpose, Integer attendeesCount) {
        this.resource = resource;
        this.user = user;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.attendeesCount = attendeesCount;
        this.status = BookingStatus.PENDING;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Resource getResource() {
        return resource;
    }
    
    public void setResource(Resource resource) {
        this.resource = resource;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
    
    public BookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(BookingStatus status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public byte[] getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(byte[] qrCode) {
        this.qrCode = qrCode;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
