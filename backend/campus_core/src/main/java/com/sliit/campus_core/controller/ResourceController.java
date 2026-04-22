package com.sliit.campus_core.controller;

import com.sliit.campus_core.dto.ResourceCreateRequest;
import com.sliit.campus_core.dto.ResourceUpdateRequest;
import com.sliit.campus_core.entity.Resource;
import com.sliit.campus_core.service.ResourceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources") // Base URL for all resource endpoints
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    //Test endpoint (to check backend is working)
    @GetMapping("/ping")
    public String ping() {
        return "Resource module working";
    }

     // GET ALL RESOURCES, Example: GET /api/resources
    // Supports filtering (type, location, capacity, status)
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

      // GET RESOURCE BY ID, eg: GET /api/resources/{id}
    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable String id) {
        return resourceService.getResourceById(id);
    }


    // CREATE RESOURCE, eg: POST /api/resources
    // Returns: 201 CREATED
    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody ResourceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

      // UPDATE RESOURCE eg,  PUT /api/resources/{id}
    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable String id, @RequestBody ResourceUpdateRequest request) {
        return resourceService.updateResource(id, request);
    }

       //UPLOAD MULTIPLE IMAGES, eg POST /api/resources/upload-images
    // Accepts multiple files and returns image URLs
    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "No files provided"));
        }

        try {
            Path baseDir = Paths.get(uploadsDir).toAbsolutePath().normalize();
            Path resourcesDir = baseDir.resolve("resources").normalize();
            Files.createDirectories(resourcesDir);

            List<String> urls = Arrays.stream(files)
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> {
                        String contentType = file.getContentType();
                        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                            throw new IllegalArgumentException("Only image files are allowed");
                        }

                        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
                        String safeOriginal = original.replaceAll("[^a-zA-Z0-9._-]", "_");
                        String fileName = UUID.randomUUID() + "-" + safeOriginal;

                        Path target = resourcesDir.resolve(fileName).normalize();
                        if (!target.startsWith(resourcesDir)) {
                            throw new IllegalArgumentException("Invalid file path");
                        }

                        try (InputStream in = file.getInputStream()) {
                            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }

                        return ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/uploads/resources/")
                                .path(fileName)
                                .toUriString();
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(urls);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to prepare upload directory"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to upload images"));
        }
    }

     // DELETE RESOURCE eg: DELETE /api/resources/{id}
    // Returns: 204 NO CONTENT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}