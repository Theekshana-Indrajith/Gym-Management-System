package com.musclehub.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DatabaseFixController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public String fixDatabase() {
        try {
            // First, ensure the table 'supplement_orders' is correct
            jdbcTemplate.execute("ALTER TABLE supplement_orders MODIFY COLUMN payment_slip LONGTEXT;");
            jdbcTemplate.execute("ALTER TABLE supplement_orders MODIFY COLUMN status VARCHAR(100);");
            jdbcTemplate.execute("ALTER TABLE supplement_orders MODIFY COLUMN delivery_method VARCHAR(100);");
            jdbcTemplate.execute("ALTER TABLE supplement_orders MODIFY COLUMN payment_method VARCHAR(100);");
            
            // Proactively fix the 'users' table wallet balance if needed
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN wallet_balance DOUBLE DEFAULT 0.0;");

            System.out.println(">>> Database Schema Fixed Successfully via /api/admin/fix-db");
            return "Database schema updated successfully! Status columns broadened to 100 chars and wallet ensured.";
        } catch (Exception e) {
            System.err.println(">>> Database Fix Error: " + e.getMessage());
            return "Error fixing database: " + e.getMessage();
        }
    }
}
