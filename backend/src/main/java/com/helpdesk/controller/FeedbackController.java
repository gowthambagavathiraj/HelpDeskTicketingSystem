package com.helpdesk.controller;

import com.helpdesk.dto.request.FeedbackRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.FeedbackResponse;
import com.helpdesk.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        FeedbackResponse response = feedbackService.submitFeedback(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Feedback submitted successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getAllFeedback()));
    }

    @GetMapping("/ratings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getAverageRatings() {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getAverageFeedbackRatings()));
    }
}
