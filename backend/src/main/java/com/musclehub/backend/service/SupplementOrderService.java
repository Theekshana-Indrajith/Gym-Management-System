package com.musclehub.backend.service;

import com.musclehub.backend.entity.*;
import com.musclehub.backend.repository.SupplementOrderRepository;
import com.musclehub.backend.repository.SupplementRepository;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupplementOrderService {

    private final SupplementOrderRepository orderRepository;
    private final SupplementRepository supplementRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public SupplementOrder placeOrder(String username, SupplementOrder orderDetails, Map<Long, Integer> cartItems) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupplementOrder order = new SupplementOrder();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setDeliveryMethod(orderDetails.getDeliveryMethod());
        order.setDeliveryAddress(orderDetails.getDeliveryAddress());
        order.setContactNumber(orderDetails.getContactNumber());
        order.setPaymentMethod(orderDetails.getPaymentMethod());
        order.setPaymentSlip(orderDetails.getPaymentSlip());

        if (orderDetails.getPaymentMethod() == SupplementOrder.PaymentMethod.ONLINE_PAYMENT) {
            order.setStatus(SupplementOrder.OrderStatus.AWAITING_PAYMENT_APPROVAL);
        } else if (orderDetails.getPaymentMethod() == SupplementOrder.PaymentMethod.WALLET) {
            order.setStatus(SupplementOrder.OrderStatus.PAYMENT_VERIFIED);
        } else {
            order.setStatus(SupplementOrder.OrderStatus.PENDING);
        }

        double total = 0;
        List<SupplementOrderItem> items = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : cartItems.entrySet()) {
            Supplement supplement = supplementRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Supplement not found: " + entry.getKey()));

            if (supplement.getStock() < entry.getValue()) {
                throw new RuntimeException("Insufficient stock for: " + supplement.getName());
            }

            // Reduce stock
            supplement.setStock(supplement.getStock() - entry.getValue());
            supplementRepository.save(supplement);

            SupplementOrderItem item = new SupplementOrderItem();
            item.setOrder(order);
            item.setSupplement(supplement);
            item.setQuantity(entry.getValue());
            item.setPriceAtPurchase(supplement.getPrice());
            items.add(item);

            total += supplement.getPrice() * entry.getValue();
        }

        // Add Courier Fee if applicable
        if (order.getDeliveryMethod() == SupplementOrder.DeliveryMethod.COURIER) {
            total += 50.0;
        }

        order.setItems(items);
        order.setTotalPrice(total);

        // Deduct from wallet if using wallet payment
        if (order.getPaymentMethod() == SupplementOrder.PaymentMethod.WALLET) {
            double currentBalance = (user.getWalletBalance() != null) ? user.getWalletBalance().doubleValue() : 0.0;
            System.out.println(">>> [CORE WALLET LOG] Transaction for User: " + user.getUsername());
            System.out.println(">>> [CORE WALLET LOG] Initial Balance: " + currentBalance);
            System.out.println(">>> [CORE WALLET LOG] Required Total: " + total);

            if (currentBalance < total) {
                System.err.println(">>> [CORE WALLET ERROR] Insufficient funds for " + user.getUsername());
                // Return stock before throwing error
                for (SupplementOrderItem item : items) {
                    Supplement s = item.getSupplement();
                    s.setStock(s.getStock() + item.getQuantity());
                    supplementRepository.save(s);
                }
                throw new RuntimeException("Insufficient wallet balance. You have LKR " + String.format("%.2f", currentBalance) + " but order total is LKR " + String.format("%.2f", total));
            }
            
            double newBalance = currentBalance - total;
            user.setWalletBalance(newBalance);
            userRepository.save(user);
            System.out.println(">>> [CORE WALLET LOG] Deduction Complete. New Wallet State: " + user.getWalletBalance());
        } else {
             System.out.println(">>> [CORE LOG] Skip Wallet Deduction. Method is: " + order.getPaymentMethod());
        }
        
        // Satisfy the weird non-nullable 'supplement_id' column in DB
        if (!items.isEmpty()) {
            order.setSupplementId(items.get(0).getSupplement().getId());
        }

        System.out.println(">>> [CORE LOG] Finalizing Order Save...");
        SupplementOrder savedOrder = orderRepository.save(order);
        System.out.println(">>> [CORE LOG] Order Save Successful. ID: " + savedOrder.getId());
        
        return savedOrder;
    }

    public List<SupplementOrder> getMyOrders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findAllByUserOrderByOrderDateDesc(user);
    }

    public List<SupplementOrder> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @Transactional
    public SupplementOrder updateOrderStatus(Long orderId, SupplementOrder.OrderStatus status) {
        SupplementOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        SupplementOrder.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        SupplementOrder savedOrder = orderRepository.save(order);
        
        if (oldStatus != SupplementOrder.OrderStatus.SHIPPED && status == SupplementOrder.OrderStatus.SHIPPED) {
            Notification notification = new Notification();
            notification.setTitle("Order Shipped!");
            notification.setMessage("Great news! Your supplement order #" + order.getId() + " has been shipped and is on its way.");
            notification.setType("ORDER_UPDATE");
            notification.setUser(order.getUser());
            notification.setRead(false);
            notificationRepository.save(notification);
        }
        
        return savedOrder;
    }

    @Transactional
    public SupplementOrder confirmReceipt(Long orderId, String username) {
        SupplementOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        order.setStatus(SupplementOrder.OrderStatus.COMPLETED);
        return orderRepository.save(order);
    }

    @Transactional
    public SupplementOrder cancelOrder(Long orderId, String username, boolean isAdmin) {
        SupplementOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = order.getUser();
        if (!isAdmin && !user.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        // 1. Status-based restriction
        if (order.getStatus() == SupplementOrder.OrderStatus.SHIPPED || 
            order.getStatus() == SupplementOrder.OrderStatus.COMPLETED || 
            order.getStatus() == SupplementOrder.OrderStatus.CANCELLED) {
            throw new RuntimeException("This order has already been processed or cancelled and cannot be changed.");
        }

        // 2. Time-based restriction (Only for members, admins can always cancel)
        if (!isAdmin) {
            LocalDateTime orderTime = order.getOrderDate();
            if (orderTime != null && orderTime.plusHours(24).isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Cancellation window expired. Orders can only be cancelled within 24 hours.");
            }
        }

        // Restock items
        for (SupplementOrderItem item : order.getItems()) {
            Supplement s = item.getSupplement();
            s.setStock(s.getStock() + item.getQuantity());
            supplementRepository.save(s);
        }

        // Refund Logic (For both Online and Wallet payments)
        System.out.println(">>> [DEBUG] Processing cancellation for Order: " + order.getId());
        
        if (order.getPaymentMethod() == SupplementOrder.PaymentMethod.ONLINE_PAYMENT || 
            order.getPaymentMethod() == SupplementOrder.PaymentMethod.WALLET) {
            
            double amountToRefund = order.getTotalPrice() != null ? order.getTotalPrice() : 0.0;
            double currentBalance = (user.getWalletBalance() != null) ? user.getWalletBalance() : 0.0;
            double newBalance = currentBalance + amountToRefund;
            
            System.out.println(">>> [DEBUG] REFUND TRIGGERED. Method: " + order.getPaymentMethod());
            user.setWalletBalance(newBalance);
            userRepository.save(user);
        }

        order.setStatus(SupplementOrder.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}
