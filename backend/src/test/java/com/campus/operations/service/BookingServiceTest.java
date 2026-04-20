package com.campus.operations.service;

import com.campus.operations.dto.BookingRequest;
import com.campus.operations.entity.*;
import com.campus.operations.exception.*;
import com.campus.operations.repository.BookingRepository;
import com.campus.operations.repository.ResourceRepository;
import com.campus.operations.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private ResourceRepository resourceRepository;
    
    @InjectMocks
    private BookingService bookingService;
    
    private User testUser;
    private Resource testResource;
    private BookingRequest validBookingRequest;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setRole(UserRole.USER);
        
        testResource = new Resource();
        testResource.setId(1L);
        testResource.setName("Conference Room");
        testResource.setLocation("Building A");
        testResource.setCapacity(10);
        testResource.setStartTime(LocalTime.of(9, 0));
        testResource.setEndTime(LocalTime.of(17, 0));
        testResource.setStatus(ResourceStatus.ACTIVE);
        
        validBookingRequest = new BookingRequest(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            "Team meeting",
            5
        );
    }
    
    @Test
    void createBooking_ValidRequest_ShouldCreateBooking() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(anyLong(), any(), any(), any(), any()))
            .thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(1L);
            return booking;
        });
        
        // When
        var result = bookingService.createBooking(validBookingRequest, "test@example.com");
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Conference Room", result.getResourceName());
        assertEquals("Test User", result.getUserName());
        assertEquals(BookingStatus.PENDING, result.getStatus());
        
        verify(bookingRepository).save(any(Booking.class));
    }
    
    @Test
    void createBooking_UserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(UserNotFoundException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_ResourceNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_ResourceNotActive_ShouldThrowException() {
        // Given
        testResource.setStatus(ResourceStatus.INACTIVE);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        // When & Then
        assertThrows(ResourceNotAvailableException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_TimeOutsideResourceHours_ShouldThrowException() {
        // Given
        BookingRequest invalidTimeRequest = new BookingRequest(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(8, 0), // Before resource opening time
            LocalTime.of(9, 0),
            "Team meeting",
            5
        );
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        // When & Then
        assertThrows(InvalidBookingTimeException.class, () -> 
            bookingService.createBooking(invalidTimeRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_StartTimeAfterEndTime_ShouldThrowException() {
        // Given
        BookingRequest invalidTimeRequest = new BookingRequest(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(14, 0),
            LocalTime.of(13, 0), // End time before start time
            "Team meeting",
            5
        );
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        // When & Then
        assertThrows(InvalidBookingTimeException.class, () -> 
            bookingService.createBooking(invalidTimeRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_ExceedsCapacity_ShouldThrowException() {
        // Given
        BookingRequest overCapacityRequest = new BookingRequest(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            "Team meeting",
            15 // Exceeds capacity of 10
        );
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        // When & Then
        assertThrows(ResourceCapacityExceededException.class, () -> 
            bookingService.createBooking(overCapacityRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_OverlappingBookingExists_ShouldThrowException() {
        // Given
        Booking existingBooking = new Booking();
        existingBooking.setId(2L);
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(anyLong(), any(), any(), any(), any()))
            .thenReturn(List.of(existingBooking));
        
        // When & Then
        assertThrows(BookingOverlapException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_NoOverlap_ShouldCreateBooking() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(anyLong(), any(), any(), any(), any()))
            .thenReturn(List.of()); // No overlapping bookings
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(1L);
            return booking;
        });
        
        // When
        var result = bookingService.createBooking(validBookingRequest, "test@example.com");
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(bookingRepository).save(any(Booking.class));
    }
    
    @Test
    void createBooking_ExactTimeOverlap_ShouldThrowException() {
        // Given
        Booking overlappingBooking = new Booking();
        overlappingBooking.setId(2L);
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(anyLong(), any(), any(), any(), any()))
            .thenReturn(List.of(overlappingBooking));
        
        // When & Then
        assertThrows(BookingOverlapException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_PartialTimeOverlap_ShouldThrowException() {
        // Given
        // New booking: 10:00 - 11:00
        // Existing booking: 10:30 - 11:30 (should overlap)
        Booking overlappingBooking = new Booking();
        overlappingBooking.setId(2L);
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(
            eq(1L), 
            eq(LocalDate.now().plusDays(1)), 
            eq(BookingStatus.APPROVED),
            eq(LocalTime.of(10, 0)), 
            eq(LocalTime.of(11, 0))
        )).thenReturn(List.of(overlappingBooking));
        
        // When & Then
        assertThrows(BookingOverlapException.class, () -> 
            bookingService.createBooking(validBookingRequest, "test@example.com"));
    }
    
    @Test
    void createBooking_NoTimeOverlap_ShouldCreateBooking() {
        // Given
        // New booking: 10:00 - 11:00
        // Existing booking: 09:00 - 09:30 (should not overlap)
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlappingBookings(anyLong(), any(), any(), any(), any()))
            .thenReturn(List.of()); // No overlap
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(1L);
            return booking;
        });
        
        // When
        var result = bookingService.createBooking(validBookingRequest, "test@example.com");
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(bookingRepository).save(any(Booking.class));
    }
}
