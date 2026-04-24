package com.sliit.campus_core.exception;


public class PasswordMatchException extends RuntimeException {
    public PasswordMatchException(String message) {
        super(message);
    }
}
