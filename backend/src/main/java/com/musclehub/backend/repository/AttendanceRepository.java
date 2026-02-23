package com.musclehub.backend.repository;

import com.musclehub.backend.entity.Attendance;
import com.musclehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserAndDate(User user, LocalDate date);

    List<Attendance> findByDate(LocalDate date);
}
