package com.helpdesk.service;

import com.helpdesk.dto.request.AnnouncementRequest;
import com.helpdesk.dto.response.AnnouncementResponse;
import com.helpdesk.entity.Announcement;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.AnnouncementRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getByCategory(String category) {
        return announcementRepository.findByCategoryOrderByCreatedAtDesc(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminEmail));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .createdBy(admin)
                .build();

        announcement = announcementRepository.save(announcement);

        // Send notifications to all students/users
        List<User> students = userRepository.findByRole(User.Role.USER);
        String title = "New Announcement: " + announcement.getTitle();
        String message = "A new announcement has been published in category '" + announcement.getCategory() + "'.";
        
        for (User student : students) {
            notificationService.createNotification(
                    student,
                    title,
                    message,
                    "ANNOUNCEMENT",
                    announcement.getId()
            );
        }

        return mapToResponse(announcement);
    }

    private AnnouncementResponse mapToResponse(Announcement announcement) {
        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .category(announcement.getCategory())
                .createdBy(announcement.getCreatedBy().getName())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }
}
