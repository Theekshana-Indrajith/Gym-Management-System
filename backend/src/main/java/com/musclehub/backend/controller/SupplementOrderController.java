package com.musclehub.backend.controller;

import com.musclehub.backend.entity.SupplementOrder;
import com.musclehub.backend.service.SupplementOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/orders")
@RequiredArgsConstructor
public class SupplementOrderController {

    private final SupplementOrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequest request) {

        System.out.println("--- Order Placement Started ---");
        System.out.println("User: " + authentication.getName());

        try {
            if (request == null || request.getCartItems() == null || request.getCartItems().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Cart is empty");
                return ResponseEntity.badRequest().body(error);
            }

            SupplementOrder orderDetails = new SupplementOrder();
            if (request.getOrderDetails() != null) {
                System.out.println(">>> [CONTROLLER LOG] Method: " + request.getOrderDetails().getPaymentMethod());
                System.out.println(">>> [CONTROLLER LOG] Delivery: " + request.getOrderDetails().getDeliveryMethod());
                orderDetails.setDeliveryMethod(request.getOrderDetails().getDeliveryMethod());
                orderDetails.setDeliveryAddress(request.getOrderDetails().getDeliveryAddress());
                orderDetails.setContactNumber(request.getOrderDetails().getContactNumber());
                orderDetails.setPaymentMethod(request.getOrderDetails().getPaymentMethod());
                orderDetails.setPaymentSlip(request.getOrderDetails().getPaymentSlip());
            }

            // Convert Map<String, Integer> to Map<Long, Integer>
            Map<Long, Integer> convertedCart = new HashMap<>();
            for (Map.Entry<String, Integer> entry : request.getCartItems().entrySet()) {
                try {
                    convertedCart.put(Long.parseLong(entry.getKey()), entry.getValue());
                } catch (NumberFormatException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Invalid product ID: " + entry.getKey());
                    return ResponseEntity.badRequest().body(error);
                }
            }

            SupplementOrder result = orderService.placeOrder(
                    authentication.getName(),
                    orderDetails,
                    convertedCart);

            System.out.println("Order Placed Successfully. ID: " + result.getId());
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            System.err.println("Business Logic Error: " + e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            System.err.println("Internal Server Error: ");
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("message",
                    "Internal Server Error: " + (e.getMessage() != null ? e.getMessage() : "Unknown Error"));
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<SupplementOrder>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmReceipt(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.confirmReceipt(id, authentication.getName()));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Internal Server Error");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(id, authentication.getName(), false));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Internal Server Error");
            return ResponseEntity.status(500).body(error);
        }
    }

    @Data
    public static class OrderRequest {
        private OrderDetailsDTO orderDetails;
        private Map<String, Integer> cartItems;
    }

    @Data
    public static class OrderDetailsDTO {
        private SupplementOrder.DeliveryMethod deliveryMethod;
        private String deliveryAddress;
        private String contactNumber;
        private SupplementOrder.PaymentMethod paymentMethod;
        private String paymentSlip;
    }
}
