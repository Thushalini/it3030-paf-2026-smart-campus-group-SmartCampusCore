package com.sliit.campus_core.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.dto.BookingRequest;
import com.sliit.campus_core.dto.BookingResponse;
import com.sliit.campus_core.dto.RejectionRequest;
import com.sliit.campus_core.entity.BookingStatus;
import com.sliit.campus_core.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    private final BookingService bookingService;
    
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal String userEmail) {
        
        BookingResponse response = bookingService.createBooking(request, userEmail);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal String userEmail) {
        
        List<BookingResponse> bookings = bookingService.getMyBookings(userEmail);
        
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String resourceId) {
        
        List<BookingResponse> bookings = bookingService.getAllBookings(status, date, resourceId);
        
        return ResponseEntity.ok(bookings);
    }
    
    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable String id) {
        BookingResponse response = bookingService.approveBooking(id);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody RejectionRequest request) {
        
        BookingResponse response = bookingService.rejectBooking(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal String userEmail) {
        
        BookingResponse response = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(response);
    }
}
