package com.musclehub.backend.repository;

import com.musclehub.backend.entity.MembershipRequest;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MembershipRequestRepository extends JpaRepository<MembershipRequest, Long> {
    List<MembershipRequest> findAllByStatus(MembershipRequest.Status status);

    Optional<MembershipRequest> findFirstByUserOrderByRequestDateDesc(User user);
}
