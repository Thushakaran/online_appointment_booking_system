package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.ProviderService;
import com.se.Online.Appointment.Booking.System.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    @Autowired
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
    @Transactional
    public ResponseEntity<Provider> createProvider(@RequestBody Provider provider, Authentication authentication) {
        System.out.println("=== Create Provider Debug ===");
        System.out.println("Authenticated user: " + authentication.getName());

        // Get the logged-in username
        String username = authentication.getName();

        // Fetch the User entity
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        System.out.println("Found user: " + user.getUsername() + ", ID: " + user.getId());

        // Link the provider to this user
        provider.setUser(user);

        Provider savedProvider = providerService.saveProvider(provider);

        System.out.println("Saved provider: " + savedProvider.getId() + ", User: " +
                (savedProvider.getUser() != null ? savedProvider.getUser().getUsername() : "null"));
        System.out.println("=== End Create Provider Debug ===");

        return ResponseEntity
                .created(URI.create("/api/providers/" + savedProvider.getId()))
                .body(savedProvider);
    }

    // Get all providers
    @GetMapping
    public ResponseEntity<List<Provider>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    // Get all providers with pagination
    @GetMapping("/paginated")
    public ResponseEntity<PaginationResponse<Provider>> getAllProvidersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(providerService.getAllProvidersPaginated(page, size));
    }

    // Search providers by general search term
    @GetMapping("/search")
    public ResponseEntity<List<Provider>> searchProviders(@RequestParam String q) {
        List<Provider> providers = providerService.searchProviders(q);
        return ResponseEntity.ok(providers);
    }

    // Search providers by general search term with pagination
    @GetMapping("/search/paginated")
    public ResponseEntity<PaginationResponse<Provider>> searchProvidersPaginated(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(providerService.searchProvidersPaginated(q, page, size));
    }

    // Search providers by service name
    @GetMapping("/search/service")
    public ResponseEntity<List<Provider>> searchByServiceName(@RequestParam String serviceName) {
        List<Provider> providers = providerService.searchByServiceName(serviceName);
        return ResponseEntity.ok(providers);
    }

    // Search providers by service name with pagination
    @GetMapping("/search/service/paginated")
    public ResponseEntity<PaginationResponse<Provider>> searchByServiceNamePaginated(
            @RequestParam String serviceName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(providerService.searchByServiceNamePaginated(serviceName, page, size));
    }

    // Search providers by city
    @GetMapping("/search/city")
    public ResponseEntity<List<Provider>> searchByCity(@RequestParam String city) {
        List<Provider> providers = providerService.searchByCity(city);
        return ResponseEntity.ok(providers);
    }

    // Search providers by city with pagination
    @GetMapping("/search/city/paginated")
    public ResponseEntity<PaginationResponse<Provider>> searchByCityPaginated(
            @RequestParam String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(providerService.searchByCityPaginated(city, page, size));
    }

    // Search providers by description
    @GetMapping("/search/description")
    public ResponseEntity<List<Provider>> searchByDescription(@RequestParam String description) {
        List<Provider> providers = providerService.searchByDescription(description);
        return ResponseEntity.ok(providers);
    }

    // Search providers by description with pagination
    @GetMapping("/search/description/paginated")
    public ResponseEntity<PaginationResponse<Provider>> searchByDescriptionPaginated(
            @RequestParam String description,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(providerService.searchByDescriptionPaginated(description, page, size));
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
    @Transactional
    public ResponseEntity<Provider> updateProvider(@PathVariable Long id,
            @RequestBody Provider providerDetails,
            Authentication authentication) {
        System.out.println("=== Provider Update Debug ===");
        System.out.println("Provider ID: " + id);
        System.out.println("Authenticated user: " + authentication.getName());

        Provider provider = providerService.getProviderById(id);
        System.out.println("Found provider: " + provider.getId());
        System.out
                .println("Provider user: " + (provider.getUser() != null ? provider.getUser().getUsername() : "null"));

        // Check ownership
        if (provider.getUser() == null) {
            System.out.println("Provider has no associated user!");
            return ResponseEntity.status(403).body(null);
        }

        // Get the authenticated user
        User authenticatedUser = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        if (!provider.getUser().getId().equals(authenticatedUser.getId())) {
            System.out.println("Ownership check failed! Provider user ID: " + provider.getUser().getId() +
                    ", Authenticated user ID: " + authenticatedUser.getId());
            return ResponseEntity.status(403).body(null);
        }

        System.out.println("Ownership check passed!");
        System.out.println("=== End Provider Update Debug ===");

        // Update provider fields but preserve the user relationship
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
        // Don't change the user relationship - keep the existing one

        Provider updatedProvider = providerService.saveProvider(provider);
        return ResponseEntity.ok(updatedProvider);
    }

    // Delete provider
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.ok("Provider deleted successfully.");
    }

    // Get provider by username
    @GetMapping("/username/{username}")
    public ResponseEntity<Provider> getProviderByUsername(@PathVariable String username) {
        Provider provider = providerService.getProviderByUsername(username);
        return ResponseEntity.ok(provider);
    }

    // Get current provider (authenticated provider)
    @GetMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Provider> getCurrentProvider(
            org.springframework.security.core.Authentication authentication) {
        Provider provider = providerService.findByUserUsername(authentication.getName());
        return ResponseEntity.ok(provider);
    }

    @GetMapping("/auth-test")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<String> testAuth(Authentication authentication) {
        System.out.println("=== Auth Test Debug ===");
        System.out.println("Authenticated user: " + authentication.getName());
        System.out.println("Authorities: " + authentication.getAuthorities());
        System.out.println("=== End Auth Test Debug ===");
        return ResponseEntity.ok("Authentication working for user: " + authentication.getName());
    }

    @GetMapping("/debug-profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<String> debugProfile(Authentication authentication) {
        System.out.println("=== Debug Profile ===");
        String username = authentication.getName();
        System.out.println("Authenticated user: " + username);

        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

            System.out.println("User found: " + user.getUsername() + ", ID: " + user.getId());

            try {
                Provider provider = providerService.findByUserId(user.getId());
                System.out.println("Provider found: " + provider.getId() + ", User ID: " +
                        (provider.getUser() != null ? provider.getUser().getId() : "null"));

                String response = String.format(
                        "User: %s (ID: %d), Provider: %d, Provider User ID: %s",
                        user.getUsername(), user.getId(), provider.getId(),
                        provider.getUser() != null ? provider.getUser().getId().toString() : "null");

                System.out.println("=== End Debug Profile ===");
                return ResponseEntity.ok(response);
            } catch (ResourceNotFoundException e) {
                System.out.println("No provider found for user");
                System.out.println("=== End Debug Profile ===");
                return ResponseEntity
                        .ok("User: " + user.getUsername() + " (ID: " + user.getId() + "), No provider found");
            }
        } catch (ResourceNotFoundException e) {
            System.out.println("User not found: " + username);
            System.out.println("=== End Debug Profile ===");
            return ResponseEntity.ok("User not found: " + username);
        }
    }

}
