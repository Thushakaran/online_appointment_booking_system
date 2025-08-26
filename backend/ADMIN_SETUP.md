# Admin User Setup Guide

## Security Notice

Admin users can no longer be created through the public registration endpoint for security reasons. This prevents unauthorized users from creating admin accounts.

## How to Create Admin Users

### Option 1: Direct Database Insert (Recommended for First Admin)

1. Start the application
2. Connect to your MySQL database
3. Insert the first admin user directly:

```sql
INSERT INTO user (username, email, password, role)
VALUES (
    'admin',
    'admin@example.com',
    '$2a$10$YourHashedPasswordHere',
    'ADMIN'
);
```

**To generate a hashed password:**

- Use an online BCrypt generator, or
- Create a temporary user through the registration endpoint and copy the hashed password from the database

### Option 2: Using Admin-Only API Endpoint

Once you have at least one admin user, you can create additional admin users through the admin dashboard or by using the admin-only API endpoint:

```
POST /api/users
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
    "username": "newadmin",
    "email": "newadmin@example.com",
    "password": "securepassword",
    "role": "ADMIN"
}
```

### Option 3: Temporary Code Modification (Development Only)

For development purposes only, you can temporarily modify the AuthController to allow admin registration:

1. Comment out the admin role validation in `AuthController.java`
2. Register the admin user through the frontend
3. Re-enable the validation

**⚠️ Remember to re-enable the validation before deploying to production!**

## Best Practices

1. Use strong, unique passwords for admin accounts
2. Limit the number of admin users
3. Regularly audit admin user accounts
4. Use different admin accounts for different purposes (e.g., system admin vs. content admin)
5. Enable two-factor authentication if possible
