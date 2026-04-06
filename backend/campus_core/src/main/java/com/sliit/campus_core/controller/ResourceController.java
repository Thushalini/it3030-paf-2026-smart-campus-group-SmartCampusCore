package com.sliit.campus_core.controller;

import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.dto.ResourceUpdateRequest;
import com.sliit.campus_core.model.Resource;
import com.sliit.campus_core.service.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/ping")
    public String ping() {
        return "Resource module working";
    }

    @GetMapping
    public List<Resource> getAllResources(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "false") boolean adminView
    ) {
        return resourceService.getAllResources(q, type, location, minCapacity, status, adminView);
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable String id) {
        return resourceService.getResourceById(id);
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody ResourceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable String id, @RequestBody ResourceUpdateRequest request) {
        return resourceService.updateResource(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}