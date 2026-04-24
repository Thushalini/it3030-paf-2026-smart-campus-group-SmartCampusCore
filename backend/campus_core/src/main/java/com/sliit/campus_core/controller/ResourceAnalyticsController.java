package com.sliit.campus_core.controller;

import com.sliit.campus_core.dto.ResourceAnalyticsResponse;
import com.sliit.campus_core.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceAnalyticsController {

    private final ResourceService resourceService;

    public ResourceAnalyticsController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ResourceAnalyticsResponse> getResourceAnalytics(
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(resourceService.getResourceAnalytics(type));
    }
}