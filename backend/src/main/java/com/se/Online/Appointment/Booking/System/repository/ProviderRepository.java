package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUserUsername(String username);

}
