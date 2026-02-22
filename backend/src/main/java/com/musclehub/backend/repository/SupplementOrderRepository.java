package com.musclehub.backend.repository;

import com.musclehub.backend.entity.SupplementOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplementOrderRepository extends JpaRepository<SupplementOrder, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT o FROM SupplementOrder o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.supplement")
    java.util.List<SupplementOrder> findAllWithDetails();
}
