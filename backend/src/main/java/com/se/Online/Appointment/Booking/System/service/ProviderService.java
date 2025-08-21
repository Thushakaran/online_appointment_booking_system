package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.model.Provider;

import java.util.List;

public interface ProviderService {
    Provider saveProvider(Provider provider);

    List<Provider> getAllProviders();

    Provider getProviderById(Long id);

    Provider updateProvider(Long id, Provider provider);

    void deleteProvider(Long id);
}
