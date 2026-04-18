package com.musclehub.backend.repository;

import com.musclehub.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    java.util.List<Equipment> findByStatus(Equipment.Status status);

    // Unavailable equipment: BROKEN or UNDER_MAINTENANCE
    java.util.List<Equipment> findByStatusIn(java.util.List<Equipment.Status> statuses);
}
