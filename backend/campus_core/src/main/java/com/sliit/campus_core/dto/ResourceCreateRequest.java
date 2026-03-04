package com.sliit.campus_core.dto;

import com.sliit.campus_core.model.ResourceStatus;
import com.sliit.campus_core.model.ResourceType;

public class ResourceCreateRequest {

    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}