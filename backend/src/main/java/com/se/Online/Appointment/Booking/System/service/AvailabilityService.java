package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.model.Availability;

import java.util.List;

public interface AvailabilityService {
    Availability createAvailability(Availability availability);

    List<Availability> getAllAvailability();

    List<Availability> getAvailabilitiesByProvider(Long providerId);

    Availability getAvailabilityById(Long id);

    Availability markAsBooked(Long id);


}
