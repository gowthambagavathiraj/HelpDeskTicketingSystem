package com.helpdesk.controller;

import com.helpdesk.dto.request.AnnouncementRequest;
import com.helpdesk.dto.response.AnnouncementResponse;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAnnouncements(
            @RequestParam(required = false) String category) {
        
        List<AnnouncementResponse> announcements;
        if (category != null && !category.trim().isEmpty()) {
            announcements = announcementService.getByCategory(category);
        } else {
            announcements = announcementService.getAllAnnouncements();
        }
        return ResponseEntity.ok(ApiResponse.ok(announcements));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnnouncementResponse response = announcementService.createAnnouncement(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Announcement created successfully", response));
    }
}
