package com.se.Online.Appointment.Booking.System.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt hashed passwords for admin user setup.
 * This is a development utility and should not be used in production.
 */
public class PasswordGenerator {

    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: java PasswordGenerator <plain-text-password>");
            System.out.println("Example: java PasswordGenerator mySecurePassword123");
            return;
        }

        String plainPassword = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode(plainPassword);

        System.out.println("Plain password: " + plainPassword);
        System.out.println("Hashed password: " + hashedPassword);
        System.out.println("\nUse this hashed password in your database insert statement.");
        System.out.println("\nExample SQL:");
        System.out.println("INSERT INTO user (username, email, password, role) VALUES ('admin', 'admin@example.com', '"
                + hashedPassword + "', 'ADMIN');");
    }
}
