package com.se.Online.Appointment.Booking.System.service.impl;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.repository.ProviderRepository;
import com.se.Online.Appointment.Booking.System.repository.AvailabilityRepository;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProviderServiceImpl implements ProviderService {
    private final ProviderRepository providerRepository;
    private final AvailabilityRepository availabilityRepository;

    public ProviderServiceImpl(ProviderRepository providerRepository, AvailabilityRepository availabilityRepository) {
        this.providerRepository = providerRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Override
    public Provider saveProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    @Override
    public List<Provider> getAllProviders() {
        List<Provider> providers = providerRepository.findAll();
        // Load availabilities for each provider
        for (Provider provider : providers) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }
        return providers;
    }

    @Override
    public Provider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
    }

    @Override
    public Provider updateProvider(Long id, Provider providerDetails) {
        Provider provider = getProviderById(id);
        provider.setUser(providerDetails.getUser());
        provider.setServiceName(providerDetails.getServiceName());
        provider.setDescription(providerDetails.getDescription());
        return providerRepository.save(provider);
    }

    @Override
    public void deleteProvider(Long id) {
        Provider provider = getProviderById(id);
        providerRepository.delete(provider);
    }

    @Override
    public Provider findByUserUsername(String username) {
        return providerRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
    }

    @Override
    public Provider getProviderByUsername(String username) {
        return findByUserUsername(username);
    }

}
