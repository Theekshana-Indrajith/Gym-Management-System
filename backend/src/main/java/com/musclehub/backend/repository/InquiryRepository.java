package com.musclehub.backend.repository;

import com.musclehub.backend.entity.Inquiry;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUser(User user);

    List<Inquiry> findByAssignedTo(User assignedTo);

    List<Inquiry> findByStatus(Inquiry.Status status);
}
