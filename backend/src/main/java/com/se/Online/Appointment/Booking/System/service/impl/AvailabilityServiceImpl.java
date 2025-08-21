package com.se.Online.Appointment.Booking.System.service.impl;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Availability;
import com.se.Online.Appointment.Booking.System.repository.AvailabilityRepository;
import com.se.Online.Appointment.Booking.System.service.AvailabilityService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {
    private final AvailabilityRepository availabilityRepository;

    public AvailabilityServiceImpl(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    @Override
    public Availability createAvailability(Availability availability) {
        return availabilityRepository.save(availability);
    }

    @Override
    public List<Availability> getAllAvailability() {
        return availabilityRepository.findAll();
    }

    @Override
    public List<Availability> getAvailabilitiesByProvider(Long providerId) {
        return availabilityRepository.findByProviderIdAndIsBookedFalse(providerId);
    }

    @Override
    public Availability getAvailabilityById(Long id) {
        return availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found with id: " + id));
    }

    @Override
    public Availability markAsBooked(Long id) {
        Availability availability = getAvailabilityById((id));
        availability.setBooked(true);
        return availabilityRepository.save(availability);
    }
}
