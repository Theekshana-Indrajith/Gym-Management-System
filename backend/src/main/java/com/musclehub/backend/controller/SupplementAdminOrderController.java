package com.musclehub.backend.controller;

import com.musclehub.backend.entity.SupplementOrder;
import com.musclehub.backend.service.SupplementOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class SupplementAdminOrderController {

    private final SupplementOrderService orderService;

    @GetMapping
    public ResponseEntity<List<SupplementOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupplementOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam SupplementOrder.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SupplementOrder> cancelOrder(@PathVariable Long id) {
        // Admin cancel: Pass null for username, true for isAdmin
        return ResponseEntity.ok(orderService.cancelOrder(id, null, true));
    }
}
