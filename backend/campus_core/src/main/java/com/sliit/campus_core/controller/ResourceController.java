package com.sliit.campus_core.controller;

import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.model.Resource;
import com.sliit.campus_core.service.ResourceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/ping")
    public String ping() {
        return "Resource module working";
    }

    @PostMapping
    public Resource createResource(@RequestBody ResourceCreateRequest request) {
        return resourceService.createResource(request);
    }
}