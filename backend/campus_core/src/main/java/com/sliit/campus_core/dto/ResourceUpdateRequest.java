package com.sliit.campus_core.dto;

import com.sliit.campus_core.model.ResourceStatus;
import com.sliit.campus_core.model.ResourceType;

import java.util.List;

public class ResourceUpdateRequest {

    private String name;
    private String resourceCode;
    private ResourceType type;
    private String description;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private String roomNumber;
    private String availabilityWindow;
    private ResourceStatus status;
    private List<String> features;
    private List<String> imageUrls;

    private Double ratingAverage;
    private Integer ratingCount;
    private Integer bookingCount;

    public ResourceUpdateRequest() {
    }

    public String getName() {
        return name;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public ResourceType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public String getBuilding() {
        return building;
    }

    public String getFloor() {
        return floor;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getAvailabilityWindow() {
        return availabilityWindow;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public List<String> getFeatures() {
        return features;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public Double getRatingAverage() {
        return ratingAverage;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public Integer getBookingCount() {
        return bookingCount;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public void setAvailabilityWindow(String availabilityWindow) {
        this.availabilityWindow = availabilityWindow;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public void setRatingAverage(Double ratingAverage) {
        this.ratingAverage = ratingAverage;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public void setBookingCount(Integer bookingCount) {
        this.bookingCount = bookingCount;
    }
}