package com.sliit.campus_core.ticket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(TicketNotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleTicketNotFound(TicketNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ErrorResponseDTO.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), null));
        }

        @ExceptionHandler(InvalidStatusTransitionException.class)
        public ResponseEntity<ErrorResponseDTO> handleInvalidStatusTransition(InvalidStatusTransitionException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "Invalid Transition", ex.getMessage(), null));
        }

        @ExceptionHandler(MaxAttachmentsExceededException.class)
        public ResponseEntity<ErrorResponseDTO> handleMaxAttachments(MaxAttachmentsExceededException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "Too Many Attachments", ex.getMessage(), null));
        }

        @ExceptionHandler(InvalidFileTypeException.class)
        public ResponseEntity<ErrorResponseDTO> handleInvalidFileType(InvalidFileTypeException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "Invalid File Type", ex.getMessage(), null));
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ErrorResponseDTO> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "File Too Large", "Maximum upload size exceeded", null));
        }

        @ExceptionHandler(MultipartException.class)
        public ResponseEntity<ErrorResponseDTO> handleMultipart(MultipartException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "Multipart Error", ex.getMessage(), null));
        }

        @ExceptionHandler(CommentNotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleCommentNotFound(CommentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponseDTO.of(HttpStatus.NOT_FOUND.value(),
                        "Comment Not Found", ex.getMessage(), null));
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponseDTO> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponseDTO.of(HttpStatus.FORBIDDEN.value(),
                        "Unauthorized", ex.getMessage(), null));
        }


        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponseDTO> handleValidation(MethodArgumentNotValidException ex) {
                Map<String, String> fieldErrors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                        .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponseDTO.of(HttpStatus.BAD_REQUEST.value(),
                                "Validation Failed", "Invalid input", fieldErrors));
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ErrorResponseDTO> handleResponseStatus(ResponseStatusException ex) {
                HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
                if (status == null) {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                }
                return ResponseEntity.status(status)
                        .body(ErrorResponseDTO.of(status.value(), status.getReasonPhrase(), ex.getReason(), null));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception ex) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ErrorResponseDTO.of(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Error", ex.getMessage(), null));
        }

        // Inner DTO for error responses
        static class ErrorResponseDTO {
                private LocalDateTime timestamp;
                private int status;
                private String error;
                private String message;
                private Map<String, String> fieldErrors;

                public static ErrorResponseDTO of(int status, String error, String message, Map<String, String> fieldErrors) {
                ErrorResponseDTO dto = new ErrorResponseDTO();
                dto.timestamp = LocalDateTime.now();
                dto.status = status;
                dto.error = error;
                dto.message = message;
                dto.fieldErrors = fieldErrors;
                return dto;
                }

                public LocalDateTime getTimestamp() { return timestamp; }
                public int getStatus() { return status; }
                public String getError() { return error; }
                public String getMessage() { return message; }
                public Map<String, String> getFieldErrors() { return fieldErrors; }
        }
}