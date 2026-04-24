package com.sliit.campus_core.dto;

import java.util.ArrayList;
import java.util.List;

public class ResourceAnalyticsResponse {

    private Summary summary;
    private List<ResourceItem> topUsedResources;
    private List<ResourceItem> underusedResources;
    private List<CountItem> resourcesByType;
    private List<CountItem> resourcesByStatus;
    private List<CountItem> resourcesByLocation;
    private List<String> insightMessages;

    public ResourceAnalyticsResponse() {
        this.summary = new Summary();
        this.topUsedResources = new ArrayList<>();
        this.underusedResources = new ArrayList<>();
        this.resourcesByType = new ArrayList<>();
        this.resourcesByStatus = new ArrayList<>();
        this.resourcesByLocation = new ArrayList<>();
        this.insightMessages = new ArrayList<>();
    }

    public ResourceAnalyticsResponse(
            Summary summary,
            List<ResourceItem> topUsedResources,
            List<ResourceItem> underusedResources,
            List<CountItem> resourcesByType,
            List<CountItem> resourcesByStatus,
            List<CountItem> resourcesByLocation,
            List<String> insightMessages
    ) {
        this.summary = summary;
        this.topUsedResources = topUsedResources;
        this.underusedResources = underusedResources;
        this.resourcesByType = resourcesByType;
        this.resourcesByStatus = resourcesByStatus;
        this.resourcesByLocation = resourcesByLocation;
        this.insightMessages = insightMessages;
    }

    public Summary getSummary() {
        return summary;
    }

    public void setSummary(Summary summary) {
        this.summary = summary;
    }

    public List<ResourceItem> getTopUsedResources() {
        return topUsedResources;
    }

    public void setTopUsedResources(List<ResourceItem> topUsedResources) {
        this.topUsedResources = topUsedResources;
    }

    public List<ResourceItem> getUnderusedResources() {
        return underusedResources;
    }

    public void setUnderusedResources(List<ResourceItem> underusedResources) {
        this.underusedResources = underusedResources;
    }

    public List<CountItem> getResourcesByType() {
        return resourcesByType;
    }

    public void setResourcesByType(List<CountItem> resourcesByType) {
        this.resourcesByType = resourcesByType;
    }

    public List<CountItem> getResourcesByStatus() {
        return resourcesByStatus;
    }

    public void setResourcesByStatus(List<CountItem> resourcesByStatus) {
        this.resourcesByStatus = resourcesByStatus;
    }

    public List<CountItem> getResourcesByLocation() {
        return resourcesByLocation;
    }

    public void setResourcesByLocation(List<CountItem> resourcesByLocation) {
        this.resourcesByLocation = resourcesByLocation;
    }

    public List<String> getInsightMessages() {
        return insightMessages;
    }

    public void setInsightMessages(List<String> insightMessages) {
        this.insightMessages = insightMessages;
    }

    public static class Summary {
        private int totalResources;
        private int activeResources;
        private int outOfServiceResources;
        private double averageRating;
        private int totalBookings;

        public Summary() {
        }

        public Summary(int totalResources, int activeResources, int outOfServiceResources, double averageRating, int totalBookings) {
            this.totalResources = totalResources;
            this.activeResources = activeResources;
            this.outOfServiceResources = outOfServiceResources;
            this.averageRating = averageRating;
            this.totalBookings = totalBookings;
        }

        public int getTotalResources() {
            return totalResources;
        }

        public void setTotalResources(int totalResources) {
            this.totalResources = totalResources;
        }

        public int getActiveResources() {
            return activeResources;
        }

        public void setActiveResources(int activeResources) {
            this.activeResources = activeResources;
        }

        public int getOutOfServiceResources() {
            return outOfServiceResources;
        }

        public void setOutOfServiceResources(int outOfServiceResources) {
            this.outOfServiceResources = outOfServiceResources;
        }

        public double getAverageRating() {
            return averageRating;
        }

        public void setAverageRating(double averageRating) {
            this.averageRating = averageRating;
        }

        public int getTotalBookings() {
            return totalBookings;
        }

        public void setTotalBookings(int totalBookings) {
            this.totalBookings = totalBookings;
        }
    }

    public static class ResourceItem {
        private String id;
        private String name;
        private String resourceCode;
        private String type;
        private String status;
        private String building;
        private String location;
        private int bookingCount;
        private Double ratingAverage;

        public ResourceItem() {
        }

        public ResourceItem(
                String id,
                String name,
                String resourceCode,
                String type,
                String status,
                String building,
                String location,
                int bookingCount,
                Double ratingAverage
        ) {
            this.id = id;
            this.name = name;
            this.resourceCode = resourceCode;
            this.type = type;
            this.status = status;
            this.building = building;
            this.location = location;
            this.bookingCount = bookingCount;
            this.ratingAverage = ratingAverage;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getResourceCode() {
            return resourceCode;
        }

        public void setResourceCode(String resourceCode) {
            this.resourceCode = resourceCode;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getBuilding() {
            return building;
        }

        public void setBuilding(String building) {
            this.building = building;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public int getBookingCount() {
            return bookingCount;
        }

        public void setBookingCount(int bookingCount) {
            this.bookingCount = bookingCount;
        }

        public Double getRatingAverage() {
            return ratingAverage;
        }

        public void setRatingAverage(Double ratingAverage) {
            this.ratingAverage = ratingAverage;
        }
    }

    public static class CountItem {
        private String key;
        private int count;

        public CountItem() {
        }

        public CountItem(String key, int count) {
            this.key = key;
            this.count = count;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }
}