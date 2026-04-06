package com.sliit.campus_core.service;

import com.sliit.campus_core.dto.ResourceAnalyticsResponse;
import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.dto.ResourceUpdateRequest;
import com.sliit.campus_core.exception.BadRequestException;
import com.sliit.campus_core.exception.ResourceNotFoundException;
import com.sliit.campus_core.model.Resource;
import com.sliit.campus_core.model.ResourceStatus;
import com.sliit.campus_core.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources(String q, String type, String location, Integer minCapacity, String status, boolean adminView) {
        List<Resource> resources = resourceRepository.findAll();

        if (!adminView) {
            resources = resources.stream()
                    .filter(resource -> resource.getStatus() == ResourceStatus.ACTIVE)
                    .collect(Collectors.toList());
        }

        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase(Locale.ROOT);
            resources = resources.stream()
                    .filter(resource ->
                            contains(resource.getName(), query) ||
                            contains(resource.getDescription(), query) ||
                            contains(resource.getResourceCode(), query) ||
                            contains(resource.getLocation(), query) ||
                            contains(resource.getBuilding(), query))
                    .collect(Collectors.toList());
        }

        if (type != null && !type.isBlank()) {
            resources = resources.stream()
                    .filter(resource -> resource.getType() != null &&
                            resource.getType().name().equalsIgnoreCase(type))
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isBlank()) {
            String locationQuery = location.toLowerCase(Locale.ROOT);
            resources = resources.stream()
                    .filter(resource ->
                            contains(resource.getLocation(), locationQuery) ||
                            contains(resource.getBuilding(), locationQuery))
                    .collect(Collectors.toList());
        }

        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(resource -> resource.getCapacity() != null && resource.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isBlank()) {
            resources = resources.stream()
                    .filter(resource -> resource.getStatus() != null &&
                            resource.getStatus().name().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        return resources;
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource createResource(ResourceCreateRequest request) {
        validateRequest(request.getName(), request.getResourceCode(), request.getType() != null, request.getCapacity(), request.getLocation(), request.getStatus() != null);

        if (resourceRepository.existsByResourceCode(request.getResourceCode())) {
            throw new BadRequestException("Resource code already exists");
        }

        Resource resource = new Resource();
        mapCreateRequestToResource(request, resource);
        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(Instant.now());

        if (resource.getRatingAverage() == null) {
            resource.setRatingAverage(0.0);
        }
        if (resource.getRatingCount() == null) {
            resource.setRatingCount(0);
        }
        if (resource.getBookingCount() == null) {
            resource.setBookingCount(0);
        }

        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, ResourceUpdateRequest request) {
        Resource existing = getResourceById(id);

        validateRequest(request.getName(), request.getResourceCode(), request.getType() != null, request.getCapacity(), request.getLocation(), request.getStatus() != null);

        if (!existing.getResourceCode().equals(request.getResourceCode())
                && resourceRepository.existsByResourceCode(request.getResourceCode())) {
            throw new BadRequestException("Resource code already exists");
        }

        existing.setName(request.getName());
        existing.setResourceCode(request.getResourceCode());
        existing.setType(request.getType());
        existing.setDescription(request.getDescription());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setBuilding(request.getBuilding());
        existing.setFloor(request.getFloor());
        existing.setRoomNumber(request.getRoomNumber());
        existing.setAvailabilityWindow(request.getAvailabilityWindow());
        existing.setStatus(request.getStatus());
        existing.setFeatures(request.getFeatures());
        existing.setImageUrl(request.getImageUrl());
        existing.setRatingAverage(request.getRatingAverage() != null ? request.getRatingAverage() : 0.0);
        existing.setRatingCount(request.getRatingCount() != null ? request.getRatingCount() : 0);
        existing.setBookingCount(request.getBookingCount() != null ? request.getBookingCount() : 0);
        existing.setUpdatedAt(Instant.now());

        return resourceRepository.save(existing);
    }

    public void deleteResource(String id) {
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }

    public List<ResourceAnalyticsResponse> getTopBookedResources() {
        return resourceRepository.findAll().stream()
                .sorted(Comparator.comparing((Resource r) -> safeInt(r.getBookingCount())).reversed())
                .limit(5)
                .map(resource -> new ResourceAnalyticsResponse(
                        resource.getId(),
                        resource.getName(),
                        resource.getResourceCode(),
                        resource.getType() != null ? resource.getType().name() : null,
                        safeInt(resource.getBookingCount()),
                        safeDouble(resource.getRatingAverage())
                ))
                .collect(Collectors.toList());
    }

    public List<ResourceAnalyticsResponse> getTopRatedResources() {
        return resourceRepository.findAll().stream()
                .sorted(Comparator.comparing((Resource r) -> safeDouble(r.getRatingAverage())).reversed())
                .limit(5)
                .map(resource -> new ResourceAnalyticsResponse(
                        resource.getId(),
                        resource.getName(),
                        resource.getResourceCode(),
                        resource.getType() != null ? resource.getType().name() : null,
                        safeInt(resource.getBookingCount()),
                        safeDouble(resource.getRatingAverage())
                ))
                .collect(Collectors.toList());
    }

    private void validateRequest(String name, String resourceCode, boolean hasType, Integer capacity, String location, boolean hasStatus) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Resource name is required");
        }
        if (resourceCode == null || resourceCode.isBlank()) {
            throw new BadRequestException("Resource code is required");
        }
        if (!hasType) {
            throw new BadRequestException("Resource type is required");
        }
        if (capacity == null || capacity < 0) {
            throw new BadRequestException("Valid capacity is required");
        }
        if (location == null || location.isBlank()) {
            throw new BadRequestException("Location is required");
        }
        if (!hasStatus) {
            throw new BadRequestException("Resource status is required");
        }
    }

    private void mapCreateRequestToResource(ResourceCreateRequest request, Resource resource) {
        resource.setName(request.getName());
        resource.setResourceCode(request.getResourceCode());
        resource.setType(request.getType());
        resource.setDescription(request.getDescription());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        resource.setRoomNumber(request.getRoomNumber());
        resource.setAvailabilityWindow(request.getAvailabilityWindow());
        resource.setStatus(request.getStatus());
        resource.setFeatures(request.getFeatures());
        resource.setImageUrl(request.getImageUrl());
        resource.setRatingAverage(request.getRatingAverage());
        resource.setRatingCount(request.getRatingCount());
        resource.setBookingCount(request.getBookingCount());
    }

    private boolean contains(String source, String query) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(query);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0 : value;
    }
}