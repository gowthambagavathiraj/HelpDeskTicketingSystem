package com.helpdesk.controller;

import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.DepartmentResponse;
import com.helpdesk.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> listDepartments() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.listDepartments()));
    }
}
