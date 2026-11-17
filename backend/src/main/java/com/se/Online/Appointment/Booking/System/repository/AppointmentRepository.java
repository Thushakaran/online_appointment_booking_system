package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.AppointmentStatus;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByProvider(Provider provider);

    Page<Appointment> findByProvider(Provider provider, Pageable pageable);

    List<Appointment> findByUser(User user);

    Page<Appointment> findByUser(User user, Pageable pageable);

    List<Appointment> findByAvailabilityId(Long availabilityId);

    long countByStatus(AppointmentStatus status);
}
