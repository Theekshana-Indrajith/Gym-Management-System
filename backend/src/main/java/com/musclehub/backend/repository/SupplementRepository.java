package com.musclehub.backend.repository;

import com.musclehub.backend.entity.Supplement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplementRepository extends JpaRepository<Supplement, Long> {
    List<Supplement> findByStockLessThan(Integer threshold);
}
