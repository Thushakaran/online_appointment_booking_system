package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByProviderIdAndIsBookedFalse(Long providerId);

    List<Availability> findByProviderId(Long providerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Availability a where a.id = :id")
    Optional<Availability> findByIdForUpdate(@Param("id") Long id);
}
