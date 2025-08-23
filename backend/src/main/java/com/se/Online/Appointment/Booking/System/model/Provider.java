package com.se.Online.Appointment.Booking.System.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String serviceName;

    private String description;

    // New fields for enhanced profile
    private String profileImage;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // Business information
    private String businessHours;
    private String specializations;
    private String education;
    private String certifications;
    private String experience;

    // Social media and contact
    private String website;
    private String linkedin;
    private String twitter;
    private String facebook;

    // Pricing and services
    private String servicePricing;
    private String acceptedInsurance;
    private String languages;

    // Profile completion
    private Boolean profileCompleted = false;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Availability> availabilities;
}
