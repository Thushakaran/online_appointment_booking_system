package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.dto.request.AppointmentRequest;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Book new appointment
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment,
            Authentication authentication) {
        System.out.println("=== Appointment Booking Request ===");
        System.out.println("Authentication: " + authentication);
        System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
        System.out.println("Authorities: " + (authentication != null ? authentication.getAuthorities() : "null"));
        System.out.println("User ID: " + (appointment.getUser() != null ? appointment.getUser().getId() : "null"));
        System.out.println(
                "Provider ID: " + (appointment.getProvider() != null ? appointment.getProvider().getId() : "null"));
        System.out.println("Availability ID: "
                + (appointment.getAvailability() != null ? appointment.getAvailability().getId() : "null"));
        System.out.println("Appointment Date: " + appointment.getAppointmentDate());
        System.out.println("Status: " + appointment.getStatus());

        try {
            // Validate that the appointment has required fields
            if (appointment.getProvider() == null || appointment.getProvider().getId() == null) {
                throw new IllegalArgumentException("Provider is required");
            }
            if (appointment.getAvailability() == null || appointment.getAvailability().getId() == null) {
                throw new IllegalArgumentException("Availability slot is required");
            }

            Appointment saved = appointmentService.bookAppointment(appointment);
            System.out.println("Appointment saved successfully with ID: " + saved.getId());
            return ResponseEntity
                    .created(URI.create("/api/appointments/" + saved.getId()))
                    .body(saved);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            throw new RuntimeException("Invalid appointment data: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error booking appointment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Get all appointments (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // Get appointments by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Appointment>> getAppointmentByUser(@PathVariable Long userId, Authentication auth) {
        User user = new User();
        user.setId(userId);
        return ResponseEntity.ok(appointmentService.getAppointmentByUser(user));
    }

    // Get appointments by provider
    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Appointment>> getAppointmentByProvider(@PathVariable Long providerId) {
        // This would need to be implemented with proper provider lookup
        return ResponseEntity.ok(List.of());
    }

    // Update appointment status
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id,
            @RequestBody AppointmentRequest request) {
        Appointment updated = appointmentService.updateAppointmentStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    // Delete appointment (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Appointment deleted successfully");
    }
}
