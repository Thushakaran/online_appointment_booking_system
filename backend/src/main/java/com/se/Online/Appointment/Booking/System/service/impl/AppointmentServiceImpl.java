package com.se.Online.Appointment.Booking.System.service.impl;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.AppointmentStatus;
import com.se.Online.Appointment.Booking.System.model.Availability;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.repository.AppointmentRepository;
import com.se.Online.Appointment.Booking.System.repository.AvailabilityRepository;
import com.se.Online.Appointment.Booking.System.repository.ProviderRepository;
import com.se.Online.Appointment.Booking.System.service.AppointmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ProviderRepository providerRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
            AvailabilityRepository availabilityRepository,
            ProviderRepository providerRepository) {
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
        this.providerRepository = providerRepository;
    }

    @Override
    @Transactional
    public Appointment bookAppointment(Appointment appointment) {
        System.out.println("=== AppointmentServiceImpl.bookAppointment ===");
        System.out.println("Processing appointment with availability ID: "
                + (appointment.getAvailability() != null ? appointment.getAvailability().getId() : "null"));

        // If appointment has availability, mark it as booked
        if (appointment.getAvailability() != null) {
            System.out.println("Checking availability ID: " + appointment.getAvailability().getId());
            Availability availability = availabilityRepository.findById(appointment.getAvailability().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Availability not found"));

            System.out.println("Found availability - ID: " + availability.getId() + ", Date: "
                    + availability.getAvailableDate() + ", Booked: " + availability.isBooked());
            if (availability.isBooked()) {
                throw new RuntimeException("This time slot is already booked");
            }

            availability.setBooked(true);
            availabilityRepository.save(availability);
            System.out.println("Marked availability as booked");
        }

        appointment.setStatus(AppointmentStatus.PENDING);
        System.out.println("Saving appointment with status: " + appointment.getStatus());
        Appointment saved = appointmentRepository.save(appointment);
        System.out.println("Appointment saved with ID: " + saved.getId());
        return saved;
    }

    @Override
    public List<Appointment> getAppointmentByUser(User user) {
        return appointmentRepository.findByUser(user);
    }

    @Override
    public List<Appointment> getAppointmentByProvider(Provider provider) {
        return appointmentRepository.findByProvider(provider);
    }

    @Override
    public List<Appointment> getAppointmentsByProviderUsername(String username) {
        // Find provider by username
        Provider provider = providerRepository.findAll().stream()
                .filter(p -> p.getUser().getUsername().equals(username))
                .findFirst()
                .orElse(null);

        if (provider == null) {
            return List.of();
        }

        return appointmentRepository.findByProvider(provider);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @Override
    @Transactional
    public Appointment updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        AppointmentStatus newStatus = AppointmentStatus.valueOf(status.toUpperCase());
        appointment.setStatus(newStatus);

        // If appointment is cancelled, free up the availability slot
        if (newStatus == AppointmentStatus.CANCELLED && appointment.getAvailability() != null) {
            Availability availability = appointment.getAvailability();
            availability.setBooked(false);
            availabilityRepository.save(availability);
        }

        return appointmentRepository.save(appointment);
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);

        // Free up the availability slot if it exists
        if (appointment.getAvailability() != null) {
            Availability availability = appointment.getAvailability();
            availability.setBooked(false);
            availabilityRepository.save(availability);
        }

        appointmentRepository.deleteById(id);
    }
}
