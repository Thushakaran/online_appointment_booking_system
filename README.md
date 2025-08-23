# Online Appointment Booking System

A full-stack web application for managing appointments between users and service providers.

## Features

- **User Management**: Register, login, and profile management with JWT authentication
- **Role System**: User (Customer), Provider, and Admin roles
- **Appointment Booking**: Browse providers and book appointments
- **Provider Dashboard**: Manage availability and view appointments
- **Admin Dashboard**: Manage all users, providers, and appointments

## Tech Stack

**Backend**: Spring Boot, Spring Security, JPA, MySQL
**Frontend**: React, Redux, Tailwind CSS

## Setup

1. **Database**: Create MySQL database `online_appointment_booking_system`
2. **Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Usage

- **Users**: Register, browse providers, book appointments
- **Providers**: Register as provider, manage availability
- **Admins**: Manage all users and appointments

## API Endpoints

- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Providers: `/api/providers/*`
- Appointments: `/api/appointments/*`
- Availability: `/api/availabilities/*`
