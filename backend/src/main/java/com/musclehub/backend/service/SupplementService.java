package com.musclehub.backend.service;

import com.musclehub.backend.entity.Supplement;
import com.musclehub.backend.repository.SupplementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplementService {

    private final SupplementRepository supplementRepository;
    private final NotificationService notificationService;

    public List<Supplement> getAllSupplements() {
        return supplementRepository.findAll();
    }

    public Supplement getSupplementById(Long id) {
        return supplementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplement not found"));
    }

    public Supplement addSupplement(Supplement supplement) {
        if (supplement.getPrice() == null || supplement.getPrice() < 0) {
            throw new RuntimeException("Price cannot be negative");
        }
        if (supplement.getStock() == null || supplement.getStock() < 0) {
            throw new RuntimeException("Stock cannot be negative");
        }
        if (supplement.getName() == null || supplement.getName().trim().isEmpty()) {
            throw new RuntimeException("Supplement name is required");
        }

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

        if (supplementDetails.getPrice() != null && supplementDetails.getPrice() < 0) {
            throw new RuntimeException("Price cannot be negative");
        }
        if (supplementDetails.getStock() != null && supplementDetails.getStock() < 0) {
            throw new RuntimeException("Stock cannot be negative");
        }

        supplement.setName(supplementDetails.getName());
        supplement.setBrand(supplementDetails.getBrand());
        supplement.setCategory(supplementDetails.getCategory());
        supplement.setPrice(supplementDetails.getPrice());
        supplement.setStock(supplementDetails.getStock());
        supplement.setDescription(supplementDetails.getDescription());
        supplement.setImage(supplementDetails.getImage());
        supplement.setServingSize(supplementDetails.getServingSize());
        supplement.setDailyFrequency(supplementDetails.getDailyFrequency());
        supplement.setSuggestedUse(supplementDetails.getSuggestedUse());

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
                    "The details for " + saved.getName() + " have been updated. New Price: LKR" + saved.getPrice()
                            + " | Stock: " + saved.getStock() + " units. Check it out!",
                    "SUPPLEMENT");
        }

        return saved;
    }

    public void deleteSupplement(Long id) {
        supplementRepository.deleteById(id);
    }

    @Transactional
    public Supplement buySupplement(Long id, Integer quantity) {
        Supplement supplement = getSupplementById(id);

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        if (supplement.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        supplement.setStock(supplement.getStock() - quantity);
        return supplementRepository.save(supplement);
    }
}
