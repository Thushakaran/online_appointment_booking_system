package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Provider> createProvider(@RequestBody Provider provider) {
        Provider saveProvider = providerService.saveProvider(provider);
        return ResponseEntity
                .created(URI.create("/api/providers" + saveProvider.getId()))
                .body(saveProvider);
    }

    // Get all providers
    @GetMapping
    public ResponseEntity<List<Provider>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    // Get provider by ID
    @GetMapping("/{id}")
    public ResponseEntity<Provider> getProviderById(@PathVariable Long id) {
        Provider provider = providerService.getProviderById(id);
        return ResponseEntity.ok(provider);
    }
}
