package com.helpdesk.controller;

import com.helpdesk.dto.request.FaqRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.FaqResponse;
import com.helpdesk.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqResponse>>> getFaqs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        
        List<FaqResponse> faqs;
        if (search != null && !search.trim().isEmpty()) {
            faqs = faqService.searchFaqs(search);
        } else if (category != null && !category.trim().isEmpty()) {
            faqs = faqService.getByCategory(category);
        } else {
            faqs = faqService.getAllFaqs();
        }
        return ResponseEntity.ok(ApiResponse.ok(faqs));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(faqService.getCategories()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FaqResponse>> createFaq(
            @Valid @RequestBody FaqRequest.Create request) {
        FaqResponse response = faqService.createFaq(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("FAQ created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FaqResponse>> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest.Update request) {
        FaqResponse response = faqService.updateFaq(id, request);
        return ResponseEntity.ok(ApiResponse.ok("FAQ updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("FAQ deleted successfully")
                .build());
    }
}
