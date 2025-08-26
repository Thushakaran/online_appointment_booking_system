package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.dto.request.AppointmentRequest;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.Provider;
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

    // Get all appointments with pagination (Admin only)
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaginationResponse<Appointment>> getAllAppointmentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsPaginated(page, size));
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

    // Get appointments by user with pagination
    @GetMapping("/user/{userId}/paginated")
    public ResponseEntity<PaginationResponse<Appointment>> getAppointmentByUserPaginated(
            @PathVariable Long userId,
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = new User();
        user.setId(userId);
        return ResponseEntity.ok(appointmentService.getAppointmentByUserPaginated(user, page, size));
    }

    // Get appointments by provider
    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Appointment>> getAppointmentByProvider(@PathVariable Long providerId) {
        Provider provider = new Provider();
        provider.setId(providerId);
        return ResponseEntity.ok(appointmentService.getAppointmentByProvider(provider));
    }

    // Get appointments by provider with pagination
    @GetMapping("/provider/{providerId}/paginated")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PaginationResponse<Appointment>> getAppointmentByProviderPaginated(
            @PathVariable Long providerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Provider provider = new Provider();
        provider.setId(providerId);
        return ResponseEntity.ok(appointmentService.getAppointmentByProviderPaginated(provider, page, size));
    }

    // Get appointments for current provider (authenticated provider)
    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsByProviderUsername(username));
    }

    // Get appointments for current provider with pagination
    @GetMapping("/my-appointments/paginated")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PaginationResponse<Appointment>> getMyAppointmentsPaginated(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsByProviderUsernamePaginated(username, page, size));
    }

    // Update appointment status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestBody String status) {
        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(updatedAppointment);
    }

    // Cancel appointment (for users to cancel their own appointments)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        Appointment appointment = appointmentService.getAppointmentById(id);

        // Check if the authenticated user is the owner of this appointment
        String currentUsername = authentication.getName();
        if (!appointment.getUser().getUsername().equals(currentUsername)) {
            return ResponseEntity.status(403).build();
        }

        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, "CANCELLED");
        return ResponseEntity.ok(updatedAppointment);
    }

    // Confirm appointment (for users to confirm their own appointments)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id, Authentication authentication) {
        Appointment appointment = appointmentService.getAppointmentById(id);

        // Check if the authenticated user is the owner of this appointment
        String currentUsername = authentication.getName();
        if (!appointment.getUser().getUsername().equals(currentUsername)) {
            return ResponseEntity.status(403).build();
        }

        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, "CONFIRMED");
        return ResponseEntity.ok(updatedAppointment);
    }

    // Delete appointment
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Appointment deleted successfully.");
    }
}
