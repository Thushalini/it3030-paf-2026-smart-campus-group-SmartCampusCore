package com.campus.operations.controller;

import com.campus.operations.dto.ResourceResponse;
import com.campus.operations.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    
    private final BookingService bookingService;
    
    public ResourceController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getActiveResources() {
        List<ResourceResponse> resources = bookingService.getActiveResources();
        return ResponseEntity.ok(resources);
    }
}
