package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.model.Availability;

import java.util.List;

public interface AvailabilityService {
    Availability createAvailability(Availability availability);

    List<Availability> getAllAvailability();

    List<Availability> getAvailabilitiesByProvider(Long providerId);

    List<Availability> getAllAvailabilitiesByProvider(Long providerId);

    Availability getAvailabilityById(Long id);

    Availability updateAvailability(Availability availability);

    Availability markAsBooked(Long id);

    void deleteAvailability(Long id);
}
