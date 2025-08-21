package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {
    private final ProviderService providerService;

    public ProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    // Create Provider
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> createProvider(@RequestBody Provider provider) {
        Provider saveProvider = providerService.saveProvider(provider);
        return ResponseEntity
                .created(URI.create("/api/providers" + saveProvider.getId()))
                .body(saveProvider);
    }

    // Get all providers
    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Provider>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    // Get provider by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> getProviderById(@PathVariable Long id) {
        Provider provider = providerService.getProviderById(id);
        return ResponseEntity.ok(provider);
    }

    @PutMapping("/{id}")
    public Provider updateProvider(@PathVariable Long id, @RequestBody Provider provider) {
        return providerService.updateProvider(id, provider);
    }

    @DeleteMapping("/{id}")
    public String deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return "Provider deleted successfully with id: " + id;
    }
}
