package com.se.Online.Appointment.Booking.System.service.impl;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.repository.ProviderRepository;
import com.se.Online.Appointment.Booking.System.repository.AvailabilityRepository;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public Provider saveProvider(Provider provider) {
        System.out.println("=== Save Provider Debug ===");
        System.out.println("Provider to save: " + provider.getId());
        System.out.println("Provider user: " + (provider.getUser() != null
                ? provider.getUser().getUsername() + " (ID: " + provider.getUser().getId() + ")"
                : "null"));

        Provider savedProvider = providerRepository.save(provider);

        System.out.println("Saved provider: " + savedProvider.getId());
        System.out.println("Saved provider user: " + (savedProvider.getUser() != null
                ? savedProvider.getUser().getUsername() + " (ID: " + savedProvider.getUser().getId() + ")"
                : "null"));
        System.out.println("=== End Save Provider Debug ===");

        return savedProvider;
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
    public PaginationResponse<Provider> getAllProvidersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Provider> providerPage = providerRepository.findAll(pageable);

        // Load availabilities for each provider in the current page
        for (Provider provider : providerPage.getContent()) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return new PaginationResponse<>(
                providerPage.getContent(),
                providerPage.getNumber(),
                providerPage.getSize(),
                providerPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Provider getProviderById(Long id) {
        System.out.println("=== Get Provider By ID Debug ===");
        System.out.println("Looking for provider with ID: " + id);

        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));

        System.out.println("Found provider: " + provider.getId());
        System.out.println("Provider user: " + (provider.getUser() != null
                ? provider.getUser().getUsername() + " (ID: " + provider.getUser().getId() + ")"
                : "null"));
        System.out.println("=== End Get Provider By ID Debug ===");

        return provider;
    }

    @Override
    public Provider updateProvider(Long id, Provider providerDetails) {
        Provider provider = getProviderById(id);
        // Don't change the user relationship - preserve the existing one
        // provider.setUser(providerDetails.getUser());
        provider.setServiceName(providerDetails.getServiceName());
        provider.setDescription(providerDetails.getDescription());
        provider.setProfileImage(providerDetails.getProfileImage());
        provider.setPhoneNumber(providerDetails.getPhoneNumber());
        provider.setAddress(providerDetails.getAddress());
        provider.setCity(providerDetails.getCity());
        provider.setState(providerDetails.getState());
        provider.setZipCode(providerDetails.getZipCode());
        provider.setCountry(providerDetails.getCountry());
        provider.setServicePricing(providerDetails.getServicePricing());
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

    @Override
    public Provider findByUserId(Long userId) {
        return providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found for user ID: " + userId));
    }

    // Search methods implementation
    @Override
    public List<Provider> searchProviders(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllProviders();
        }

        List<Provider> providers = providerRepository.searchProviders(searchTerm.trim());

        // Load availabilities for each provider
        for (Provider provider : providers) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return providers;
    }

    @Override
    public PaginationResponse<Provider> searchProvidersPaginated(String searchTerm, int page, int size) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllProvidersPaginated(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Provider> providerPage = providerRepository.searchProvidersPaginated(searchTerm.trim(), pageable);

        // Load availabilities for each provider in the current page
        for (Provider provider : providerPage.getContent()) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return new PaginationResponse<>(
                providerPage.getContent(),
                providerPage.getNumber(),
                providerPage.getSize(),
                providerPage.getTotalElements());
    }

    @Override
    public List<Provider> searchByServiceName(String serviceName) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return getAllProviders();
        }

        List<Provider> providers = providerRepository.findByServiceNameContainingIgnoreCase(serviceName.trim());

        // Load availabilities for each provider
        for (Provider provider : providers) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return providers;
    }

    @Override
    public PaginationResponse<Provider> searchByServiceNamePaginated(String serviceName, int page, int size) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return getAllProvidersPaginated(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Provider> providerPage = providerRepository.findByServiceNameContainingIgnoreCase(serviceName.trim(),
                pageable);

        // Load availabilities for each provider in the current page
        for (Provider provider : providerPage.getContent()) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return new PaginationResponse<>(
                providerPage.getContent(),
                providerPage.getNumber(),
                providerPage.getSize(),
                providerPage.getTotalElements());
    }

    @Override
    public List<Provider> searchByCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            return getAllProviders();
        }

        List<Provider> providers = providerRepository.findByCityContainingIgnoreCase(city.trim());

        // Load availabilities for each provider
        for (Provider provider : providers) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return providers;
    }

    @Override
    public PaginationResponse<Provider> searchByCityPaginated(String city, int page, int size) {
        if (city == null || city.trim().isEmpty()) {
            return getAllProvidersPaginated(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Provider> providerPage = providerRepository.findByCityContainingIgnoreCase(city.trim(), pageable);

        // Load availabilities for each provider in the current page
        for (Provider provider : providerPage.getContent()) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return new PaginationResponse<>(
                providerPage.getContent(),
                providerPage.getNumber(),
                providerPage.getSize(),
                providerPage.getTotalElements());
    }

    @Override
    public List<Provider> searchByDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return getAllProviders();
        }

        List<Provider> providers = providerRepository.findByDescriptionContainingIgnoreCase(description.trim());

        // Load availabilities for each provider
        for (Provider provider : providers) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return providers;
    }

    @Override
    public PaginationResponse<Provider> searchByDescriptionPaginated(String description, int page, int size) {
        if (description == null || description.trim().isEmpty()) {
            return getAllProvidersPaginated(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Provider> providerPage = providerRepository.findByDescriptionContainingIgnoreCase(description.trim(),
                pageable);

        // Load availabilities for each provider in the current page
        for (Provider provider : providerPage.getContent()) {
            List<com.se.Online.Appointment.Booking.System.model.Availability> availabilities = availabilityRepository
                    .findByProviderIdAndIsBookedFalse(provider.getId());
            provider.setAvailabilities(availabilities);
        }

        return new PaginationResponse<>(
                providerPage.getContent(),
                providerPage.getNumber(),
                providerPage.getSize(),
                providerPage.getTotalElements());
    }

    @Override
    public long getTotalProvidersCount() {
        return providerRepository.count();
    }

}
