package com.se.Online.Appointment.Booking.System.service.impl;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.repository.ProviderRepository;
import com.se.Online.Appointment.Booking.System.service.ProviderService;

import java.util.List;

public class ProviderServiceImpl implements ProviderService {
    private final ProviderRepository providerRepository;

    public ProviderServiceImpl(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    @Override
    public Provider saveProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    @Override
    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    @Override
    public Provider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
    }
}
