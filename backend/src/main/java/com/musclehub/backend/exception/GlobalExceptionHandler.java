package com.musclehub.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        System.err.println(">>> GLOBAL EXCEPTION: " + e.getClass().getName() + " : " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Backend Error: " + e.getMessage());
    }
}
