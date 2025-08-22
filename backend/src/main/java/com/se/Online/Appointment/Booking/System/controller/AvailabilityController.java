package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.model.Availability;
import com.se.Online.Appointment.Booking.System.service.AvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
public class AvailabilityController {
    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    // Create availability
    @PostMapping
    public ResponseEntity<Availability> createAvailability(@RequestBody Availability availability) {
        Availability saved = availabilityService.createAvailability(availability);
        return ResponseEntity
                .created(URI.create("/api/availabilities" + saved.getId()))
                .body(saved);
    }

    // Get all availabilities
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Availability>> getAllAvailabilities() {
        return ResponseEntity.ok(availabilityService.getAllAvailability());
    }

    // Get availabilities by provider (only unbooked)
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Availability>> getAvailabilitiesByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(availabilityService.getAvailabilitiesByProvider(providerId));
    }

    // Get availability by ID
    @GetMapping("/{id}")
    public ResponseEntity<Availability> getAvailabilityById(@PathVariable Long id) {
        return ResponseEntity.ok(availabilityService.getAvailabilityById(id));
    }

    // Mark availability as booked
    @PutMapping("/{id}/book")
    public ResponseEntity<Availability> markAsBooked(@PathVariable Long id) {
        Availability booked = availabilityService.markAsBooked(id);
        return ResponseEntity.ok(booked);
    }
}
