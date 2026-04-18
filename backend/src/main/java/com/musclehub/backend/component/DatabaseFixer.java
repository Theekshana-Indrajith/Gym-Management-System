package com.musclehub.backend.component;

import com.musclehub.backend.repository.SupplementOrderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixer {

    private final SupplementOrderRepository supplementOrderRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void fixOrphanedOrders() {
        log.info("Checking for orphaned supplement orders and fixing inquiry schema...");
        try {
            // Fix Inquiries table schema if user_id was NOT NULL
            log.info("Ensuring Inquiries table allows NULL user_id for guest messages...");
            jdbcTemplate.execute("ALTER TABLE inquiries MODIFY user_id BIGINT NULL;");
            
            // Just in case sender columns are missing
            try {
                jdbcTemplate.execute("ALTER TABLE inquiries ADD COLUMN sender_name VARCHAR(255) NULL;");
                jdbcTemplate.execute("ALTER TABLE inquiries ADD COLUMN sender_email VARCHAR(255) NULL;");
            } catch (Exception inner) {
                // Columns probably already exist
            }
        } catch (Exception e) {
            log.warn("Inquiry schema update skipped (might already be up to date): {}", e.getMessage());
        }
        
        try {
            supplementOrderRepository.findAll().forEach(order -> {
                if (order.getItems().isEmpty() || order.getUser() == null) {
                    log.warn("Deleting orphaned order ID: {}", order.getId());
                    supplementOrderRepository.delete(order);
                }
            });
        } catch (Exception e) {
            log.error(
                    "Failed to clean orphaned orders. This is likely due to constraint violations. Cleaning manually...");
        }
    }
}
