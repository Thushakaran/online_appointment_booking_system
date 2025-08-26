package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.model.Availability;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.service.AvailabilityService;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
public class AvailabilityController {
    private final AvailabilityService availabilityService;
    private final ProviderService providerService;

    public AvailabilityController(AvailabilityService availabilityService, ProviderService providerService) {
        this.availabilityService = availabilityService;
        this.providerService = providerService;
    }

    // Create availability (Provider only)
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Availability> createAvailability(@RequestBody Availability availability,
            Authentication auth) {
        // Get the logged-in provider
        Provider provider = providerService.getProviderByUsername(auth.getName());
        availability.setProvider(provider);

        Availability saved = availabilityService.createAvailability(availability);
        return ResponseEntity
                .created(URI.create("/api/availabilities/" + saved.getId()))
                .body(saved);
    }

    // Get all availabilities (Admin only)
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

    // Get my availabilities (Provider only)
    @GetMapping("/my-availabilities")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Availability>> getMyAvailabilities(Authentication auth) {
        try {
            System.out.println("=== Get My Availabilities Debug ===");
            System.out.println("Authenticated user: " + auth.getName());

            Provider provider = providerService.getProviderByUsername(auth.getName());
            System.out.println("Provider found: " + provider.getId());

            List<Availability> availabilities = availabilityService.getAllAvailabilitiesByProvider(provider.getId());
            System.out.println("Found " + availabilities.size() + " availabilities");

            for (Availability availability : availabilities) {
                System.out.println("Availability ID: " + availability.getId() + ", Provider ID: "
                        + availability.getProvider().getId());
            }

            System.out.println("=== End Get My Availabilities Debug ===");

            // Return all availabilities for the provider, not just unbooked ones
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            System.err.println("Error in getMyAvailabilities: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Get availability by ID
    @GetMapping("/{id}")
    public ResponseEntity<Availability> getAvailabilityById(@PathVariable Long id) {
        return ResponseEntity.ok(availabilityService.getAvailabilityById(id));
    }

    // Update availability (Provider only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Availability> updateAvailability(@PathVariable Long id,
            @RequestBody Availability availabilityDetails, Authentication auth) {
        Availability availability = availabilityService.getAvailabilityById(id);

        // Check ownership using the authenticated user
        Provider provider = providerService.getProviderByUsername(auth.getName());
        if (!availability.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Update only the available date, preserve the booking status
        availability.setAvailableDate(availabilityDetails.getAvailableDate());
        // Don't update isBooked status from the request to prevent unauthorized booking
        // changes

        Availability updated = availabilityService.updateAvailability(availability);
        return ResponseEntity.ok(updated);
    }

    // Mark availability as booked
    @PutMapping("/{id}/book")
    public ResponseEntity<Availability> markAsBooked(@PathVariable Long id) {
        Availability booked = availabilityService.markAsBooked(id);
        return ResponseEntity.ok(booked);
    }

    // Delete availability (Provider only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<String> deleteAvailability(@PathVariable Long id, Authentication auth) {
        try {
            System.out.println("=== Delete Availability Debug ===");
            System.out.println("Deleting availability with ID: " + id);
            System.out.println("Authenticated user: " + auth.getName());
            System.out.println("Authentication object: " + auth);
            System.out.println("Authentication principal: " + auth.getPrincipal());
            System.out.println("Authentication authorities: " + auth.getAuthorities());

            // First, get the availability to check if it exists
            Availability availability = availabilityService.getAvailabilityById(id);
            System.out.println("Found availability: " + availability.getId());
            System.out.println("Availability provider: " + availability.getProvider());
            System.out.println("Availability provider ID: " + availability.getProvider().getId());

            // Get the current provider
            Provider provider = providerService.getProviderByUsername(auth.getName());
            System.out.println("Current provider: " + provider);
            System.out.println("Current provider ID: " + provider.getId());
            System.out.println("Current provider user: " + provider.getUser());
            System.out.println("Current provider user ID: " + provider.getUser().getId());

            // Check ownership
            if (!availability.getProvider().getId().equals(provider.getId())) {
                System.out.println("Access denied - ownership mismatch");
                System.out.println("Availability provider ID: " + availability.getProvider().getId());
                System.out.println("Current provider ID: " + provider.getId());
                return ResponseEntity.status(403)
                        .body("You can only delete your own availabilities. Availability belongs to provider ID: "
                                + availability.getProvider().getId() + ", but you are provider ID: "
                                + provider.getId());
            }

            System.out.println("Ownership verified. Proceeding with deletion...");
            availabilityService.deleteAvailability(id);
            System.out.println("Availability deleted successfully");
            System.out.println("=== End Delete Availability Debug ===");

            return ResponseEntity.ok("Availability deleted successfully");
        } catch (RuntimeException e) {
            System.err.println("Runtime error in deleteAvailability: " + e.getMessage());
            // Check if it's a business logic error (like having associated appointments)
            if (e.getMessage().contains("associated appointment")) {
                return ResponseEntity.status(400).body(e.getMessage());
            }
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error in deleteAvailability: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Debug endpoint to check availability ownership
    @GetMapping("/debug/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<String> debugAvailabilityOwnership(@PathVariable Long id, Authentication auth) {
        try {
            System.out.println("=== Debug Availability Ownership ===");
            System.out.println("Checking availability with ID: " + id);
            System.out.println("Authenticated user: " + auth.getName());

            // Get the availability
            Availability availability = availabilityService.getAvailabilityById(id);
            System.out.println("Availability found: " + availability.getId());
            System.out.println("Availability provider ID: " + availability.getProvider().getId());

            // Get the current provider
            Provider provider = providerService.getProviderByUsername(auth.getName());
            System.out.println("Current provider ID: " + provider.getId());

            boolean isOwner = availability.getProvider().getId().equals(provider.getId());
            System.out.println("Is owner: " + isOwner);

            String debugInfo = String.format(
                    "Availability ID: %d\n" +
                            "Availability Provider ID: %d\n" +
                            "Current Provider ID: %d\n" +
                            "Is Owner: %s\n" +
                            "Authenticated User: %s",
                    availability.getId(),
                    availability.getProvider().getId(),
                    provider.getId(),
                    isOwner,
                    auth.getName());

            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            System.err.println("Error in debugAvailabilityOwnership: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
