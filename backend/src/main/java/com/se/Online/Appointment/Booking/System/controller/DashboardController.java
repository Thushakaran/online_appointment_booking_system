package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.service.AppointmentService;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import com.se.Online.Appointment.Booking.System.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProviderService providerService;
    private final AppointmentService appointmentService;
    private final UserService userService;

    public DashboardController(ProviderService providerService,
            AppointmentService appointmentService,
            UserService userService) {
        this.providerService = providerService;
        this.appointmentService = appointmentService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Get total providers count
            long totalProviders = providerService.getTotalProvidersCount();

            // Get total appointments count
            long totalAppointments = appointmentService.getTotalAppointmentsCount();

            // Get upcoming appointments count (appointments with status SCHEDULED)
            long upcomingAppointments = appointmentService.getUpcomingAppointmentsCount();

            // Get total users count
            long totalUsers = userService.getTotalUsersCount();

            stats.put("totalProviders", totalProviders);
            stats.put("totalAppointments", totalAppointments);
            stats.put("upcomingAppointments", upcomingAppointments);
            stats.put("totalUsers", totalUsers);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            stats.put("error", "Failed to fetch dashboard statistics");
            return ResponseEntity.internalServerError().body(stats);
        }
    }
}
