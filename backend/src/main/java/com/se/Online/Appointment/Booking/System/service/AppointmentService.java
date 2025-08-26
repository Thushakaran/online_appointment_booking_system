package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.dto.PaginationResponse;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;

import java.util.List;

public interface AppointmentService {
    Appointment bookAppointment(Appointment appointment);

    List<Appointment> getAppointmentByUser(User user);

    PaginationResponse<Appointment> getAppointmentByUserPaginated(User user, int page, int size);

    List<Appointment> getAppointmentByProvider(Provider provider);

    PaginationResponse<Appointment> getAppointmentByProviderPaginated(Provider provider, int page, int size);

    List<Appointment> getAppointmentsByProviderUsername(String username);

    PaginationResponse<Appointment> getAppointmentsByProviderUsernamePaginated(String username, int page, int size);

    List<Appointment> getAllAppointments();

    PaginationResponse<Appointment> getAllAppointmentsPaginated(int page, int size);

    Appointment getAppointmentById(Long id);

    Appointment updateAppointmentStatus(Long id, String status);

    void deleteAppointment(Long id);

    // Dashboard statistics
    long getTotalAppointmentsCount();

    long getUpcomingAppointmentsCount();
}
