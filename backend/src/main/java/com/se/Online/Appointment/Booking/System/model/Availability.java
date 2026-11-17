package com.se.Online.Appointment.Booking.System.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    @JsonBackReference
    private Provider provider;

    private LocalDateTime availableDate;

    private boolean isBooked = false;

    @Override
    public String toString() {
        return "Availability{" +
                "id=" + id +
                ", availableDate=" + availableDate +
                ", isBooked=" + isBooked +
                ", providerId=" + (provider != null ? provider.getId() : null) +
                '}';
    }
}
