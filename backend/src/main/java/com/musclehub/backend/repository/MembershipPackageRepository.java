package com.musclehub.backend.repository;

import com.musclehub.backend.entity.MembershipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MembershipPackageRepository extends JpaRepository<MembershipPackage, Long> {
    List<MembershipPackage> findAllByIsActiveTrue();
}
