package com.helpdesk.service;

import com.helpdesk.dto.request.FaqRequest;
import com.helpdesk.dto.response.FaqResponse;
import com.helpdesk.entity.Faq;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    @Transactional(readOnly = true)
    public List<FaqResponse> getAllFaqs() {
        return faqRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FaqResponse> getByCategory(String category) {
        return faqRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FaqResponse> searchFaqs(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllFaqs();
        }
        return faqRepository.searchFaqs(query.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return faqRepository.findDistinctCategories();
    }

    @Transactional
    public FaqResponse createFaq(FaqRequest.Create request) {
        Faq faq = Faq.builder()
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .category(request.getCategory())
                .build();
        return mapToResponse(faqRepository.save(faq));
    }

    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest.Update request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", id));

        if (request.getQuestion() != null) {
            faq.setQuestion(request.getQuestion());
        }
        if (request.getAnswer() != null) {
            faq.setAnswer(request.getAnswer());
        }
        if (request.getCategory() != null) {
            faq.setCategory(request.getCategory());
        }

        return mapToResponse(faqRepository.save(faq));
    }

    @Transactional
    public void deleteFaq(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", id));
        faqRepository.delete(faq);
    }

    private FaqResponse mapToResponse(Faq faq) {
        return FaqResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .build();
    }
}
