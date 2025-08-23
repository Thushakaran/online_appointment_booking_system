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
    public List<Availability> getAllAvailabilitiesByProvider(Long providerId) {
        return availabilityRepository.findByProviderId(providerId);
    }

    @Override
    public Availability getAvailabilityById(Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found with id: " + id));

        // Ensure provider is loaded
        if (availability.getProvider() != null) {
            System.out.println("Availability " + id + " has provider ID: " + availability.getProvider().getId());
        } else {
            System.out.println("WARNING: Availability " + id + " has null provider!");
        }

        return availability;
    }

    @Override
    public Availability updateAvailability(Availability availability) {
        return availabilityRepository.save(availability);
    }

    @Override
    public Availability markAsBooked(Long id) {
        Availability availability = getAvailabilityById(id);
        if (availability.isBooked()) {
            throw new RuntimeException("This time slot is already booked");
        }
        availability.setBooked(true);
        return availabilityRepository.save(availability);
    }

    @Override
    public void deleteAvailability(Long id) {
        Availability availability = getAvailabilityById(id);
        availabilityRepository.delete(availability);
    }
}
