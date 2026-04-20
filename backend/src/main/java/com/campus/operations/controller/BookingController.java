package com.campus.operations.controller;

import com.campus.operations.dto.*;
import com.campus.operations.entity.BookingStatus;
import com.campus.operations.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmail = userDetails.getUsername();
        BookingResponse response = bookingService.createBooking(request, userEmail);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmail = userDetails.getUsername();
        List<BookingResponse> bookings = bookingService.getMyBookings(userEmail);
        
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long resourceId) {
        
        List<BookingResponse> bookings = bookingService.getAllBookings(status, date, resourceId);
        
        return ResponseEntity.ok(bookings);
    }
    
    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable Long id) {
        BookingResponse response = bookingService.approveBooking(id);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectionRequest request) {
        
        BookingResponse response = bookingService.rejectBooking(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmail = userDetails.getUsername();
        BookingResponse response = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(response);
    }
}
