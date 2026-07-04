package com.helpdesk.dto.response;

import com.helpdesk.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private User.Role role;
    private DepartmentResponse department;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
