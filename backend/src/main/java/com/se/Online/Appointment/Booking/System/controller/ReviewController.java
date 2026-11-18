package com.se.Online.Appointment.Booking.System.controller;

import com.se.Online.Appointment.Booking.System.dto.ReviewResponse;
import com.se.Online.Appointment.Booking.System.model.Appointment;
import com.se.Online.Appointment.Booking.System.model.AppointmentStatus;
import com.se.Online.Appointment.Booking.System.model.Review;
import com.se.Online.Appointment.Booking.System.model.User;
import com.se.Online.Appointment.Booking.System.repository.AppointmentRepository;
import com.se.Online.Appointment.Booking.System.repository.ReviewRepository;
import com.se.Online.Appointment.Booking.System.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, AppointmentRepository appointmentRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/provider/{providerId}")
    public List<ReviewResponse> getProviderReviews(@PathVariable Long providerId) {
        return reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(this::toResponse).toList();
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewResponse> getAppointmentReview(@PathVariable Long appointmentId,
            Authentication authentication) {
        Appointment appointment = getOwnedAppointment(appointmentId, authentication);
        return reviewRepository.findByAppointmentId(appointment.getId())
                .map(review -> ResponseEntity.ok(toResponse(review)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewResponse> createReview(@PathVariable Long appointmentId,
            @RequestBody Map<String, Object> body, Authentication authentication) {
        Appointment appointment = getOwnedAppointment(appointmentId, authentication);
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only completed appointments can be reviewed");
        }
        int rating;
        try { rating = Integer.parseInt(String.valueOf(body.get("rating"))); }
        catch (Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5"); }
        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        if (reviewRepository.existsByAppointmentId(appointmentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment already has a review");
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Review review = new Review();
        review.setAppointment(appointment);
        review.setProvider(appointment.getProvider());
        review.setUser(user);
        review.setRating(rating);
        String comment = body.get("comment") == null ? "" : String.valueOf(body.get("comment")).trim();
        if (comment.length() > 1200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review comments must be 1,200 characters or fewer");
        }
        review.setComment(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(reviewRepository.save(review)));
    }

    private Appointment getOwnedAppointment(Long id, Authentication authentication) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (appointment.getUser() == null || !appointment.getUser().getUsername().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return appointment;
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(review.getId(), review.getAppointment().getId(), review.getProvider().getId(),
                review.getUser().getUsername(), review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
