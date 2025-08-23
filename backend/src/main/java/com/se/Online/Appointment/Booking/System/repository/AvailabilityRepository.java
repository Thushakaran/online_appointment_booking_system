package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByProviderIdAndIsBookedFalse(Long providerId);

    List<Availability> findByProviderId(Long providerId);
}
