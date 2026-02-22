package com.musclehub.backend.service;

import com.musclehub.backend.entity.Supplement;
import com.musclehub.backend.entity.SupplementOrder;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.SupplementOrderRepository;
import com.musclehub.backend.repository.SupplementRepository;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplementService {

    private final SupplementRepository supplementRepository;
    private final SupplementOrderRepository supplementOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<Supplement> getAllSupplements() {
        return supplementRepository.findAll();
    }

    public Supplement getSupplementById(Long id) {
        return supplementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplement not found"));
    }

    public Supplement addSupplement(Supplement supplement) {
        Supplement saved = supplementRepository.save(supplement);
        notificationService.createGlobalNotification(
                "New Supplement Added! 📢",
                saved.getName() + " by " + saved.getBrand() + " is now available in the store.",
                "SUPPLEMENT");
        return saved;
    }

    public Supplement updateSupplement(Long id, Supplement supplementDetails) {
        Supplement supplement = getSupplementById(id);

        boolean wasOutOfStock = (supplement.getStock() == null || supplement.getStock() <= 0);

        supplement.setName(supplementDetails.getName());
        supplement.setBrand(supplementDetails.getBrand());
        supplement.setCategory(supplementDetails.getCategory());
        supplement.setPrice(supplementDetails.getPrice());
        supplement.setStock(supplementDetails.getStock());
        supplement.setDescription(supplementDetails.getDescription());
        supplement.setImage(supplementDetails.getImage());

        Supplement saved = supplementRepository.save(supplement);

        if (wasOutOfStock && saved.getStock() != null && saved.getStock() > 0) {
            notificationService.createGlobalNotification(
                    "Back in Stock! 🔥",
                    saved.getName() + " is now back in stock with " + saved.getStock()
                            + " units available. Get yours now!",
                    "SUPPLEMENT");
        } else {
            notificationService.createGlobalNotification(
                    "Supplement Updated: " + saved.getName(),
                    "The details for " + saved.getName() + " have been updated. New Price: $" + saved.getPrice()
                            + " | Stock: " + saved.getStock() + " units. Check it out!",
                    "SUPPLEMENT");
        }

        return saved;
    }

    public void deleteSupplement(Long id) {
        supplementRepository.deleteById(id);
    }

    @Transactional
    public Supplement buySupplement(Long id, Integer quantity, String username) {
        Supplement supplement = getSupplementById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (supplement.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        supplement.setStock(supplement.getStock() - quantity);
        Supplement savedSupplement = supplementRepository.save(supplement);

        SupplementOrder order = new SupplementOrder();
        order.setSupplement(savedSupplement);
        order.setUser(user);
        order.setQuantity(quantity);
        order.setTotalPrice(supplement.getPrice() * quantity);
        order.setOrderDate(java.time.LocalDateTime.now()); // Explicitly set
        supplementOrderRepository.save(order);

        return savedSupplement;
    }
}
