package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.model.Provider;

import java.util.List;

public interface ProviderService {
    Provider saveProvider(Provider provider);

    List<Provider> getAllProviders();

    PaginationResponse<Provider> getAllProvidersPaginated(int page, int size);

    Provider getProviderById(Long id);

    Provider updateProvider(Long id, Provider provider);

    void deleteProvider(Long id);

    public Provider findByUserUsername(String username);

    Provider getProviderByUsername(String username);

    Provider findByUserId(Long userId);

    // Search methods
    List<Provider> searchProviders(String searchTerm);

    PaginationResponse<Provider> searchProvidersPaginated(String searchTerm, int page, int size);

    List<Provider> searchByServiceName(String serviceName);

    PaginationResponse<Provider> searchByServiceNamePaginated(String serviceName, int page, int size);

    List<Provider> searchByCity(String city);

    PaginationResponse<Provider> searchByCityPaginated(String city, int page, int size);

    List<Provider> searchByDescription(String description);

    PaginationResponse<Provider> searchByDescriptionPaginated(String description, int page, int size);

    // Dashboard statistics
    long getTotalProvidersCount();
}
