package com.helpdesk.dto.response;

import com.helpdesk.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private Long id;
    private String name;
    private String email;
    private User.Role role;
    private DepartmentResponse department;
}
