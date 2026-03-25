package com.musclehub.backend.repository;

import com.musclehub.backend.entity.SupplementOrder;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplementOrderRepository extends JpaRepository<SupplementOrder, Long> {
    List<SupplementOrder> findAllByUserOrderByOrderDateDesc(User user);

    List<SupplementOrder> findAllByOrderByOrderDateDesc();
}
