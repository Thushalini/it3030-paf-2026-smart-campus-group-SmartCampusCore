package com.sliit.campus_core.service;

import com.sliit.campus_core.dto.ResourceAnalyticsResponse;
import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.dto.ResourceUpdateRequest;
import com.sliit.campus_core.exception.BadRequestException;
import com.sliit.campus_core.exception.ResourceNotFoundException;
import com.sliit.campus_core.model.Resource;
import com.sliit.campus_core.model.ResourceStatus;
import com.sliit.campus_core.model.ResourceType;
import com.sliit.campus_core.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
        existing.setImageUrls(normalizeImageUrls(request.getImageUrls()));
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

    public ResourceAnalyticsResponse getResourceAnalytics(String type) {
        List<Resource> resources = resourceRepository.findAll();
        resources = filterByTypeIfPresent(resources, type);

        int totalResources = resources.size();
        int activeResources = (int) resources.stream()
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .count();
        int outOfServiceResources = (int) resources.stream()
                .filter(r -> r.getStatus() == ResourceStatus.OUT_OF_SERVICE)
                .count();
        int totalBookings = resources.stream()
                .mapToInt(r -> safeInt(r.getBookingCount()))
                .sum();

        double averageRating = calculateAverageRating(resources);

        ResourceAnalyticsResponse.Summary summary = new ResourceAnalyticsResponse.Summary(
                totalResources,
                activeResources,
                outOfServiceResources,
                averageRating,
                totalBookings
        );

        List<ResourceAnalyticsResponse.ResourceItem> topUsedResources = resources.stream()
                .sorted(Comparator.comparing((Resource r) -> safeInt(r.getBookingCount())).reversed())
                .limit(5)
                .map(this::toResourceItem)
                .collect(Collectors.toList());

        List<ResourceAnalyticsResponse.ResourceItem> underusedResources = resources.stream()
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .filter(r -> {
                    int bookings = safeInt(r.getBookingCount());
                    Double ratingAvg = r.getRatingAverage();
                    return bookings == 0
                            || bookings < 5
                            || (ratingAvg != null && ratingAvg < 3.0);
                })
                .sorted(Comparator.comparing((Resource r) -> safeInt(r.getBookingCount()))
                        .thenComparing(r -> safeDoubleNullable(r.getRatingAverage())))
                .map(this::toResourceItem)
                .collect(Collectors.toList());

        List<ResourceAnalyticsResponse.CountItem> resourcesByType = toCountItems(
                resources.stream()
                        .map(r -> r.getType() != null ? r.getType().name() : "UNKNOWN")
                        .collect(Collectors.groupingBy(k -> k, Collectors.counting()))
        );

        List<ResourceAnalyticsResponse.CountItem> resourcesByStatus = toCountItems(
                resources.stream()
                        .map(r -> r.getStatus() != null ? r.getStatus().name() : "UNKNOWN")
                        .collect(Collectors.groupingBy(k -> k, Collectors.counting()))
        );

        List<ResourceAnalyticsResponse.CountItem> resourcesByLocation = toCountItems(
                resources.stream()
                        .map(this::locationKey)
                        .collect(Collectors.groupingBy(k -> k, Collectors.counting()))
        );

        List<String> insightMessages = generateInsightMessages(
                underusedResources.size(),
                outOfServiceResources,
                resourcesByType
        );

        return new ResourceAnalyticsResponse(
                summary,
                topUsedResources,
                underusedResources,
                resourcesByType,
                resourcesByStatus,
                resourcesByLocation,
                insightMessages
        );
    }

    private List<Resource> filterByTypeIfPresent(List<Resource> resources, String type) {
        if (type == null || type.isBlank() || "ALL".equalsIgnoreCase(type)) {
            return resources;
        }

        String normalized = type.trim().toUpperCase(Locale.ROOT);
        ResourceType enumType;
        try {
            enumType = ResourceType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return resources;
        }

        return resources.stream()
                .filter(r -> r.getType() == enumType)
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
        resource.setImageUrls(normalizeImageUrls(request.getImageUrls()));
        resource.setRatingAverage(request.getRatingAverage());
        resource.setRatingCount(request.getRatingCount());
        resource.setBookingCount(request.getBookingCount());
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> unique = new LinkedHashSet<>();
        for (String url : imageUrls) {
            if (url == null) {
                continue;
            }
            String trimmed = url.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            unique.add(trimmed);
        }
        return new ArrayList<>(unique);
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

    private double safeDoubleNullable(Double value) {
        return value == null ? Double.MAX_VALUE : value;
    }

    private double calculateAverageRating(List<Resource> resources) {
        List<Double> ratings = resources.stream()
                .map(Resource::getRatingAverage)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (ratings.isEmpty()) {
            return 0.0;
        }
        double sum = ratings.stream().mapToDouble(Double::doubleValue).sum();
        return sum / ratings.size();
    }

    private ResourceAnalyticsResponse.ResourceItem toResourceItem(Resource r) {
        return new ResourceAnalyticsResponse.ResourceItem(
                r.getId(),
                r.getName(),
                r.getResourceCode(),
                r.getType() != null ? r.getType().name() : null,
                r.getStatus() != null ? r.getStatus().name() : null,
                normalizeBlank(r.getBuilding()),
                normalizeBlank(r.getLocation()),
                safeInt(r.getBookingCount()),
                r.getRatingAverage()
        );
    }

    private String locationKey(Resource r) {
        String building = normalizeBlank(r.getBuilding());
        if (building != null) {
            return building;
        }
        String location = normalizeBlank(r.getLocation());
        if (location != null) {
            return location;
        }
        return "UNKNOWN";
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private List<ResourceAnalyticsResponse.CountItem> toCountItems(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Map.Entry.comparingByKey()))
                .map(e -> new ResourceAnalyticsResponse.CountItem(e.getKey(), Math.toIntExact(e.getValue())))
                .collect(Collectors.toList());
    }

    private List<String> generateInsightMessages(
            int underusedCount,
            int outOfServiceCount,
            List<ResourceAnalyticsResponse.CountItem> resourcesByType
    ) {
        List<String> messages = new ArrayList<>();

        if (underusedCount > 0) {
            messages.add(underusedCount + " resources are underused and may need attention");
        } else {
            messages.add("No underused resources detected (ACTIVE resources look healthy)");
        }

        ResourceAnalyticsResponse.CountItem mostCommonType = resourcesByType.stream()
                .filter(ci -> ci.getKey() != null && !"UNKNOWN".equalsIgnoreCase(ci.getKey()))
                .findFirst()
                .orElse(null);
        if (mostCommonType != null) {
            messages.add(formatTypeLabel(mostCommonType.getKey()) + " are the most common resource type");
        }

        if (outOfServiceCount > 0) {
            messages.add(outOfServiceCount + " resources are currently out of service");
        }

        return messages;
    }

    private String formatTypeLabel(String key) {
        if (key == null) {
            return "Unknown";
        }
        return key.replace('_', ' ').toLowerCase(Locale.ROOT);
    }
}