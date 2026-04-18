package com.musclehub.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("message", e.getMessage());
        return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        System.err.println(">>> GLOBAL EXCEPTION: " + e.getClass().getName() + " : " + e.getMessage());
        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("message", "Internal Server Error: " + e.getMessage());
        return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
