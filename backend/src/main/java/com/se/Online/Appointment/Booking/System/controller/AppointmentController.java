package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.dto.request.AppointmentRequest;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.AppointmentService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        Appointment saved = appointmentService.bookAppointment(appointment);
        return ResponseEntity
                .created(URI.create("/api/appointment/" + saved.getId()))
                .body(saved);
    }

    // Get appointments by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Appointment>> getAppointmentUser(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId); // minimal object
        return ResponseEntity.ok(appointmentService.getAppointmentByUser(user));
    }
   

    // Update appointment status
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        Appointment updated = appointmentService.updateAppointmentStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}

