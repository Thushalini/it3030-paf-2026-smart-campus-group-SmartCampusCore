package com.campus.operations.exception;

public class InvalidBookingTimeException extends RuntimeException {
    public InvalidBookingTimeException(String message) {
        super(message);
    }
}
