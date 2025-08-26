package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User saveUser(User user);

    Optional<User> findByUsername(String username);

    Optional<User> findById(Long id);

    List<User> getAllUser();

    PaginationResponse<User> getAllUsersPaginated(int page, int size);

    User updateUser(Long id, User userDetails);

    void deleteUser(Long id);

    // Dashboard statistics
    long getTotalUsersCount();
}
