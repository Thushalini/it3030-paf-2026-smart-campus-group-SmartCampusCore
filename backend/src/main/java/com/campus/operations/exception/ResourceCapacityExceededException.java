package com.campus.operations.exception;

public class ResourceCapacityExceededException extends RuntimeException {
    public ResourceCapacityExceededException(String message) {
        super(message);
    }
}
