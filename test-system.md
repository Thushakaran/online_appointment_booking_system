# System Test Guide

## Prerequisites

1. MySQL database running with database `online_appointment_booking_system`
2. Backend running on `http://localhost:8081`
3. Frontend running on `http://localhost:5173`

## Test Scenarios

### 1. User Registration & Login

1. Open `http://localhost:5173`
2. Click "Register"
3. Create a user account with role "USER"
4. Login with the created account
5. Verify redirect to Dashboard

### 2. Provider Registration & Setup

1. Register a new account with role "PROVIDER"
2. Login and verify redirect to Provider Dashboard
3. Add service name and description
4. Add availability slots
5. Verify availability appears in the list

### 3. Admin Access

1. Register a new account with role "ADMIN"
2. Login and verify redirect to Admin Dashboard
3. Verify you can see all users, providers, and appointments

### 4. Appointment Booking

1. Login as a USER
2. Go to Providers page
3. Select a provider with available slots
4. Book an appointment
5. Verify appointment appears in "My Appointments"

### 5. Provider Management

1. Login as a PROVIDER
2. Add/remove availability slots
3. Update service information
4. View upcoming appointments

### 6. Admin Management

1. Login as an ADMIN
2. View all users, providers, and appointments
3. Delete users/providers/appointments
4. Verify system statistics

## Expected Results

- ✅ All registration flows work correctly
- ✅ Role-based access control functions properly
- ✅ Appointment booking process is complete
- ✅ Provider availability management works
- ✅ Admin dashboard shows all data
- ✅ JWT authentication works across all endpoints
- ✅ UI is responsive and user-friendly

## Common Issues & Solutions

1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **CORS Issues**: Backend CORS is configured for `http://localhost:5173`
3. **JWT Token**: Check browser console for authentication errors
4. **Port Conflicts**: Ensure ports 8081 (backend) and 5173 (frontend) are available
