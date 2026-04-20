package com.campus.operations.exception;

import com.campus.operations.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBookingNotFound(BookingNotFoundException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "BOOKING_NOT_FOUND");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "RESOURCE_NOT_FOUND");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "USER_NOT_FOUND");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(BookingOverlapException.class)
    public ResponseEntity<ErrorResponse> handleBookingOverlap(BookingOverlapException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "BOOKING_OVERLAP");
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(InvalidBookingStatusException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBookingStatus(InvalidBookingStatusException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "INVALID_BOOKING_STATUS");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(InvalidBookingTimeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBookingTime(InvalidBookingTimeException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "INVALID_BOOKING_TIME");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ResourceNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotAvailable(ResourceNotAvailableException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "RESOURCE_NOT_AVAILABLE");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ResourceCapacityExceededException.class)
    public ResponseEntity<ErrorResponse> handleResourceCapacityExceeded(ResourceCapacityExceededException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "RESOURCE_CAPACITY_EXCEEDED");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "UNAUTHORIZED_ACCESS");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler(QRCodeGenerationException.class)
    public ResponseEntity<ErrorResponse> handleQRCodeGeneration(QRCodeGenerationException ex) {
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "QR_CODE_GENERATION_FAILED");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorResponse response = new ErrorResponse("Access denied", "ACCESS_DENIED");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("status", "VALIDATION_ERROR");
        response.put("errors", errors);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse response = new ErrorResponse("An unexpected error occurred", "INTERNAL_SERVER_ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
