package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByProvider(Provider provider);

    List<Appointment> findByUser(User user);
}
