package com.sliit.campus_core.exception;

public class InvalidBookingTimeException extends RuntimeException {
    public InvalidBookingTimeException(String message) {
        super(message);
    }
}
