package com.sliit.campus_core.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.sliit.campus_core.dto.BookingRequest;
import com.sliit.campus_core.dto.BookingResponse;
import com.sliit.campus_core.dto.RejectionRequest;
import com.sliit.campus_core.dto.ResourceResponse;
import com.sliit.campus_core.entity.Booking;
import com.sliit.campus_core.entity.BookingStatus;
import com.sliit.campus_core.entity.Resource;
import com.sliit.campus_core.entity.ResourceStatus;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.exception.BookingNotFoundException;
import com.sliit.campus_core.exception.BookingOverlapException;
import com.sliit.campus_core.exception.InvalidBookingStatusException;
import com.sliit.campus_core.exception.InvalidBookingTimeException;
import com.sliit.campus_core.exception.QRCodeGenerationException;
import com.sliit.campus_core.exception.ResourceCapacityExceededException;
import com.sliit.campus_core.exception.ResourceNotAvailableException;
import com.sliit.campus_core.exception.ResourceNotFoundException;
import com.sliit.campus_core.exception.UnauthorizedAccessException;
import com.sliit.campus_core.exception.UserNotFoundException;
import com.sliit.campus_core.repository.BookingRepository;
import com.sliit.campus_core.repository.ResourceRepository;
import com.sliit.campus_core.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ResourceRepository resourceRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + request.getResourceId()));

        validateResource(resource);
        validateBookingTime(resource, request.getStartTime(), request.getEndTime());
        validateNoOverlap(resource.getId(), request.getDate(), request.getStartTime(), request.getEndTime());
        validateCapacity(resource, request.getAttendeesCount());

        Booking booking = new Booking(
                resource,
                user,
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose(),
                request.getAttendeesCount()
        );

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings(BookingStatus status, LocalDate date, String resourceId) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .filter(booking -> date == null || date.equals(booking.getDate()))
                .filter(booking -> resourceId == null || resourceId.isBlank()
                        || (booking.getResource() != null && resourceId.equals(booking.getResource().getId())))
                .sorted(Comparator.comparing(
                        Booking::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .collect(Collectors.toList());

        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse approveBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStatusException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setQrCode(generateQRCode(booking));

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public BookingResponse rejectBooking(String bookingId, RejectionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStatusException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason());

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public BookingResponse cancelBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStatusException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public List<ResourceResponse> getActiveResources() {
        List<Resource> resources = resourceRepository.findByStatusOrderByName(ResourceStatus.ACTIVE);

        return resources.stream()
                .map(this::convertToResourceResponse)
                .collect(Collectors.toList());
    }

    private void validateResource(Resource resource) {
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResourceNotAvailableException("Resource is not available: " + resource.getName());
        }
    }

    private void validateBookingTime(Resource resource, LocalTime startTime, LocalTime endTime) {
        LocalTime resourceStart = resource.getStartTime() != null ? resource.getStartTime() : LocalTime.MIN;
        LocalTime resourceEnd = resource.getEndTime() != null ? resource.getEndTime() : LocalTime.MAX;

        if (startTime.isBefore(resourceStart) || endTime.isAfter(resourceEnd)) {
            throw new InvalidBookingTimeException("Booking time must be within resource availability window");
        }

        if (!startTime.isBefore(endTime)) {
            throw new InvalidBookingTimeException("Start time must be before end time");
        }
    }

    private void validateNoOverlap(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                resourceId, date, BookingStatus.APPROVED, startTime, endTime
        );

        if (!overlappingBookings.isEmpty()) {
            throw new BookingOverlapException("Booking overlaps with existing approved booking");
        }
    }

    private void validateCapacity(Resource resource, Integer attendeesCount) {
        if (attendeesCount > resource.getCapacity()) {
            throw new ResourceCapacityExceededException("Attendees count exceeds resource capacity");
        }
    }

    private byte[] generateQRCode(Booking booking) {
        try {
            String qrContent = String.format(
                    "Booking ID: %s, Resource: %s, Date: %s, Time: %s - %s",
                    booking.getId(),
                    booking.getResource().getName(),
                    booking.getDate(),
                    booking.getStartTime(),
                    booking.getEndTime()
            );

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 200, 200);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new QRCodeGenerationException("Failed to generate QR code", e);
        }
    }

    private BookingResponse convertToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        if (booking.getResource() != null) {
            response.setResourceId(booking.getResource().getId());
            response.setResourceName(booking.getResource().getName());
            response.setResourceLocation(booking.getResource().getLocation());
        }

        if (booking.getUser() != null) {
            response.setUserId(booking.getUser().getId());
            response.setUserName(booking.getUser().getName());
            response.setUserEmail(booking.getUser().getEmail());
        }
        response.setDate(booking.getDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setAttendeesCount(booking.getAttendeesCount());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());

        if (booking.getQrCode() != null) {
            response.setQrCodeBase64(Base64.getEncoder().encodeToString(booking.getQrCode()));
        }

        return response;
    }

    private ResourceResponse convertToResourceResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setDescription(resource.getDescription());
        response.setLocation(resource.getLocation());
        response.setCapacity(resource.getCapacity());
        response.setStartTime(resource.getStartTime());
        response.setEndTime(resource.getEndTime());
        response.setStatus(resource.getStatus());

        return response;
    }
}