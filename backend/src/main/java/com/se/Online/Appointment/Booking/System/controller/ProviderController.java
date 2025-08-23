package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import com.se.Online.Appointment.Booking.System.service.UserService;
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
    private final UserService userService;

    public ProviderController(ProviderService providerService, UserService userService) {
        this.providerService = providerService;
        this.userService = userService;
    }

    // Create Provider
    // @PostMapping
    // @PreAuthorize("hasRole('PROVIDER')")
    // public ResponseEntity<Provider> createProvider(@RequestBody Provider
    // provider) {
    // Provider saveProvider = providerService.saveProvider(provider);
    // return ResponseEntity
    // .created(URI.create("/api/providers" + saveProvider.getId()))
    // .body(saveProvider);
    // }
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> createProvider(@RequestBody Provider provider, Authentication authentication) {
        // Get the logged-in username
        String username = authentication.getName();

        // Fetch the User entity
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Link the provider to this user
        provider.setUser(user);

        Provider savedProvider = providerService.saveProvider(provider);

        return ResponseEntity
                .created(URI.create("/api/providers/" + savedProvider.getId()))
                .body(savedProvider);
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

    // @PutMapping("/{id}")
    // public Provider updateProvider(@PathVariable Long id, @RequestBody Provider
    // provider) {
    // return providerService.updateProvider(id, provider);
    // }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> updateProvider(@PathVariable Long id,
            @RequestBody Provider providerDetails,
            Authentication authentication) {
        Provider provider = providerService.getProviderById(id);

        // Check ownership
        if (!provider.getUser().getUsername().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        provider.setServiceName(providerDetails.getServiceName());
        provider.setDescription(providerDetails.getDescription());
        provider.setProfileImage(providerDetails.getProfileImage());
        provider.setPhoneNumber(providerDetails.getPhoneNumber());
        provider.setAddress(providerDetails.getAddress());
        provider.setCity(providerDetails.getCity());
        provider.setState(providerDetails.getState());
        provider.setZipCode(providerDetails.getZipCode());
        provider.setCountry(providerDetails.getCountry());
        provider.setBusinessHours(providerDetails.getBusinessHours());
        provider.setSpecializations(providerDetails.getSpecializations());
        provider.setEducation(providerDetails.getEducation());
        provider.setCertifications(providerDetails.getCertifications());
        provider.setExperience(providerDetails.getExperience());
        provider.setWebsite(providerDetails.getWebsite());
        provider.setLinkedin(providerDetails.getLinkedin());
        provider.setTwitter(providerDetails.getTwitter());
        provider.setFacebook(providerDetails.getFacebook());
        provider.setServicePricing(providerDetails.getServicePricing());
        provider.setAcceptedInsurance(providerDetails.getAcceptedInsurance());
        provider.setLanguages(providerDetails.getLanguages());
        provider.setProfileCompleted(providerDetails.getProfileCompleted());

        Provider updatedProvider = providerService.saveProvider(provider);
        return ResponseEntity.ok(updatedProvider);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return "Provider deleted successfully with id: " + id;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> getMyProvider(Authentication authentication) {
        String username = authentication.getName(); // logged-in user
        Provider provider = providerService.getAllProviders().stream()
                .filter(p -> p.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found for user: " + username));
        return ResponseEntity.ok(provider);
    }

}
