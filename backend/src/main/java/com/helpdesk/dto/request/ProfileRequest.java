package com.helpdesk.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 15, message = "Phone number must be less than 15 characters")
    private String phoneNumber;

    @Size(max = 5, message = "Country code must be less than 5 characters")
    private String countryCode;

    @Size(min = 6, max = 50, message = "Password must be at least 6 characters if provided")
    private String password;

    private Long departmentId;
}
