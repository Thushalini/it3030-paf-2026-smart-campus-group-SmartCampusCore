package com.sliit.campus_core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ✅ 404 - NOT FOUND
    @ExceptionHandler({
            ResourceNotFoundException.class,
            BookingNotFoundException.class,
            UserNotFoundException.class
    })
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), "NOT_FOUND");
    }

    // ✅ 400 - BAD REQUEST (validation / client errors)
    @ExceptionHandler({
            BadRequestException.class,
            BookingOverlapException.class,
            InvalidBookingStatusException.class,
            InvalidBookingTimeException.class,
            ResourceCapacityExceededException.class,
            PasswordMatchException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), "BAD_REQUEST");
    }

    // ✅ 409 - CONFLICT (duplicate data)
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(EmailAlreadyExistsException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), "EMAIL_ALREADY_EXISTS");
    }

    // ✅ 401 - UNAUTHORIZED (authentication failure)
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(InvalidCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), "INVALID_CREDENTIALS");
    }

    // ✅ 403 - FORBIDDEN (authorization failure)
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(UnauthorizedAccessException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), "FORBIDDEN");
    }

    // ✅ 500 - INTERNAL SERVER ERROR (server issues)
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<Map<String, Object>> handleFileError(FileStorageException ex) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "File upload failed. Please try again later.",
                "FILE_UPLOAD_ERROR"
        );
    }

    // ✅ VALIDATION ERRORS (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {

        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return buildResponse(HttpStatus.BAD_REQUEST, "Validation Error", errorMessage, "VALIDATION_ERROR");
    }

    // ✅ MALFORMED JSON
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON Request",
                "Invalid data format",
                "MALFORMED_JSON"
        );
    }

    // ✅ FALLBACK (catch-all)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected error occurred",
                "INTERNAL_ERROR"
        );
    }

    // ✅ COMMON RESPONSE BUILDER
    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String error,
            String message,
            String code
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now());
        response.put("status", status.value());
        response.put("error", error);
        response.put("message", message);
        response.put("code", code);
        return ResponseEntity.status(status).body(response);
    }
}