package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.exception.ResourceNotFoundException;
import com.se.Online.Appointment.Booking.System.model.Role;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Create user (register)
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return ResponseEntity.ok(userService.saveUser(user));
    }

    // Get all user
    @GetMapping
    public ResponseEntity<List<User>> getAllUser() {
        return ResponseEntity.ok(userService.getAllUser());
    }

    // Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updateUser) {
        User user = userService.findById((id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setUsername(updateUser.getUsername());
        user.setEmail(updateUser.getEmail());
        user.setPassword(updateUser.getPassword());
        user.setRole(updateUser.getRole());

        return ResponseEntity.ok(userService.saveUser(user));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }
}
