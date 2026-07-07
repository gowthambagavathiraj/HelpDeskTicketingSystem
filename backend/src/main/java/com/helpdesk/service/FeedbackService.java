package com.helpdesk.service;

import com.helpdesk.dto.request.FeedbackRequest;
import com.helpdesk.dto.response.FeedbackResponse;
import com.helpdesk.entity.Feedback;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.FeedbackRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Feedback feedback = Feedback.builder()
                .user(user)
                .aiRating(request.getAiRating())
                .staffRating(request.getStaffRating())
                .overallRating(request.getOverallRating())
                .comment(request.getComment())
                .build();

        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getAverageFeedbackRatings() {
        return feedbackRepository.getAverageRatings();
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .studentName(feedback.getUser().getName())
                .studentEmail(feedback.getUser().getEmail())
                .aiRating(feedback.getAiRating())
                .staffRating(feedback.getStaffRating())
                .overallRating(feedback.getOverallRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
