package com.sliit.campus_core.service;

import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.model.Resource;
import com.sliit.campus_core.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource createResource(ResourceCreateRequest request) {

        Resource resource = new Resource();

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(request.getStatus());

        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(Instant.now());

        return resourceRepository.save(resource);
    }
}