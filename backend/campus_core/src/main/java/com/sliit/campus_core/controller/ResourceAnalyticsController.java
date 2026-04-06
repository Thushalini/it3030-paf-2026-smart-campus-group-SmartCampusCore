package com.sliit.campus_core.controller;

import com.sliit.campus_core.dto.ResourceAnalyticsResponse;
import com.sliit.campus_core.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceAnalyticsController {

    private final ResourceService resourceService;

    public ResourceAnalyticsController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/top-booked")
    public List<ResourceAnalyticsResponse> getTopBookedResources() {
        return resourceService.getTopBookedResources();
    }

    @GetMapping("/top-rated")
    public List<ResourceAnalyticsResponse> getTopRatedResources() {
        return resourceService.getTopRatedResources();
    }
}