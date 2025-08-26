package com.se.Online.Appointment.Booking.System.repository;

import com.se.Online.Appointment.Booking.System.model.Provider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUserUsername(String username);

    Optional<Provider> findByUserId(Long userId);

    // Search by service name (case-insensitive)
    List<Provider> findByServiceNameContainingIgnoreCase(String serviceName);

    Page<Provider> findByServiceNameContainingIgnoreCase(String serviceName, Pageable pageable);

    // Search by description (case-insensitive)
    List<Provider> findByDescriptionContainingIgnoreCase(String description);

    Page<Provider> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);

    // Search by city (case-insensitive)
    List<Provider> findByCityContainingIgnoreCase(String city);

    Page<Provider> findByCityContainingIgnoreCase(String city, Pageable pageable);

    // Search by state (case-insensitive)
    List<Provider> findByStateContainingIgnoreCase(String state);

    // Search by address (case-insensitive)
    List<Provider> findByAddressContainingIgnoreCase(String address);

    // Search by username (case-insensitive)
    @Query("SELECT p FROM Provider p WHERE LOWER(p.user.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Provider> findByUserUsernameContainingIgnoreCase(@Param("username") String username);

    // Comprehensive search across multiple fields
    @Query("SELECT DISTINCT p FROM Provider p WHERE " +
            "LOWER(p.serviceName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.state) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.address) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.user.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Provider> searchProviders(@Param("searchTerm") String searchTerm);

    // Comprehensive search across multiple fields with pagination
    @Query("SELECT DISTINCT p FROM Provider p WHERE " +
            "LOWER(p.serviceName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.state) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.address) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.user.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Provider> searchProvidersPaginated(@Param("searchTerm") String searchTerm, Pageable pageable);
}
