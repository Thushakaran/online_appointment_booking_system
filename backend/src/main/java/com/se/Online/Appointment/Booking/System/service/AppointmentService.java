package com.se.Online.Appointment.Booking.System.service;

import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.Provider;
import com.se.Online.Appointment.Booking.System.model.User;

import java.util.List;

public interface AppointmentService {
    Appointment bookAppointment(Appointment appointment);

    List<Appointment> getAppointmentByUser(User user);

    List<Appointment> getAppointmentByProvider(Provider provider);

    Appointment updateAppointmentStatus(Long id, String status);
}
