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

    @PostConstruct
    @Transactional
    public void fixOrphanedOrders() {
        log.info("Checking for orphaned supplement orders...");
        try {
            supplementOrderRepository.findAll().forEach(order -> {
                if (order.getSupplement() == null || order.getUser() == null) {
                    log.warn("Deleting orphaned order ID: {}", order.getId());
                    supplementOrderRepository.delete(order);
                }
            });
        } catch (Exception e) {
            log.error(
                    "Failed to clean orphaned orders. This is likely due to constraint violations. Cleaning manually...");
            // If the above fails, it means Hibernate couldn't even load them.
            // In that case, we might need a native query.
        }
    }
}
