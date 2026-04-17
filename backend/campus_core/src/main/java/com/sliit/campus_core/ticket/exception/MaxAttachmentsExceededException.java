package com.sliit.campus_core.ticket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MaxAttachmentsExceededException extends RuntimeException {
    public MaxAttachmentsExceededException(String message) {
        super(message);
    }
}