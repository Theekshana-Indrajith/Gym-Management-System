package com.musclehub.backend.controller;

import com.musclehub.backend.entity.Supplement;
import com.musclehub.backend.service.SupplementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplements")
@RequiredArgsConstructor
public class SupplementController {

    private final SupplementService supplementService;

    @GetMapping
    public ResponseEntity<List<Supplement>> getAllSupplements() {
        return ResponseEntity.ok(supplementService.getAllSupplements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplement> getSupplementById(@PathVariable Long id) {
        return ResponseEntity.ok(supplementService.getSupplementById(id));
    }

    @PostMapping
    public ResponseEntity<Supplement> addSupplement(@RequestBody Supplement supplement) {
        return ResponseEntity.ok(supplementService.addSupplement(supplement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplement> updateSupplement(@PathVariable Long id, @RequestBody Supplement supplement) {
        return ResponseEntity.ok(supplementService.updateSupplement(id, supplement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplement(@PathVariable Long id) {
        supplementService.deleteSupplement(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<Supplement> buySupplement(@PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer quantity,
            java.security.Principal principal) {
        return ResponseEntity.ok(supplementService.buySupplement(id, quantity, principal.getName()));
    }
}
