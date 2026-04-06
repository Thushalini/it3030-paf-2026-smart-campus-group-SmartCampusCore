package com.sliit.campus_core.dto;

public class ResourceAnalyticsResponse {

    private String id;
    private String name;
    private String resourceCode;
    private String type;
    private Integer bookingCount;
    private Double ratingAverage;

    public ResourceAnalyticsResponse() {
    }

    public ResourceAnalyticsResponse(String id, String name, String resourceCode, String type, Integer bookingCount, Double ratingAverage) {
        this.id = id;
        this.name = name;
        this.resourceCode = resourceCode;
        this.type = type;
        this.bookingCount = bookingCount;
        this.ratingAverage = ratingAverage;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public String getType() {
        return type;
    }

    public Integer getBookingCount() {
        return bookingCount;
    }

    public Double getRatingAverage() {
        return ratingAverage;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setBookingCount(Integer bookingCount) {
        this.bookingCount = bookingCount;
    }

    public void setRatingAverage(Double ratingAverage) {
        this.ratingAverage = ratingAverage;
    }
}