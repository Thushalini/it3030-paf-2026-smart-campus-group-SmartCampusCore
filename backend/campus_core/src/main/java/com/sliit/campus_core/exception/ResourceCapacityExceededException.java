package com.sliit.campus_core.exception;

public class ResourceCapacityExceededException extends RuntimeException {
    public ResourceCapacityExceededException(String message) {
        super(message);
    }
}
