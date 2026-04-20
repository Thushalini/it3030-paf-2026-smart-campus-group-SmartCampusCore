package com.campus.operations.exception;

public class BookingOverlapException extends RuntimeException {
    public BookingOverlapException(String message) {
        super(message);
    }
}
