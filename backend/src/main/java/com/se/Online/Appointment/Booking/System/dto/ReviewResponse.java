package com.se.Online.Appointment.Booking.System.dto;

import java.time.LocalDateTime;

public record ReviewResponse(Long id, Long appointmentId, Long providerId, String reviewer,
        int rating, String comment, LocalDateTime createdAt) {}
