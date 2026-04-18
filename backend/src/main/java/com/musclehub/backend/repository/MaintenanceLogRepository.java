package com.musclehub.backend.repository;

import com.musclehub.backend.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByEquipmentId(Long equipmentId);
    @Query("SELECT m FROM MaintenanceLog m WHERE m.equipment.id = :equipmentId ORDER BY m.logDate DESC")
    List<MaintenanceLog> findByEquipmentIdOrderByLogDateDesc(@Param("equipmentId") Long equipmentId);

    List<MaintenanceLog> findByStatus(MaintenanceLog.LogStatus status);

    @Query("SELECT m FROM MaintenanceLog m WHERE m.equipment.id = :equipmentId AND m.status = :status ORDER BY m.logDate DESC")
    java.util.List<MaintenanceLog> findRecentByEquipmentAndStatus(@Param("equipmentId") Long equipmentId, @Param("status") MaintenanceLog.LogStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE MaintenanceLog m SET m.reportedBy = null WHERE m.reportedBy.id = :id")
    void nullifyReportedBy(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE MaintenanceLog m SET m.technician = null WHERE m.technician.id = :id")
    void nullifyTechnician(Long id);
}
