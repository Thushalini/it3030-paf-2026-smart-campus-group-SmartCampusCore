package com.sliit.campus_core.dto;

import com.sliit.campus_core.entity.ResourceStatus;
import lombok.Data;

@Data
public class ResourceResponse {
    private String id;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String startTime;
    private String endTime;
    private ResourceStatus status;

    
}
