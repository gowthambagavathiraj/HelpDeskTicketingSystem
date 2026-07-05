package com.helpdesk.config;

import com.helpdesk.entity.Department;
import com.helpdesk.entity.User;
import com.helpdesk.repository.DepartmentRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.helpdesk.service.EmailService emailService;
    
    @org.springframework.beans.factory.annotation.Value("${app.admin.name}")
    private String adminName;
    
    @org.springframework.beans.factory.annotation.Value("${app.admin.email}")
    private String adminEmail;
    
    @org.springframework.beans.factory.annotation.Value("${app.admin.password}")
    private String adminPassword;
    
    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void run(String... args) {
        seedDepartments();
        seedAdminUser();
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            List<String> departments = List.of(
                    "IT Support", "Maintenance", "HR", "Administration", "Finance", "Operations"
            );
            departments.forEach(name ->
                departmentRepository.save(Department.builder().departmentName(name).build())
            );
            log.info("Seeded {} default departments", departments.size());
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            String verificationToken = java.util.UUID.randomUUID().toString();
            boolean emailVerified = false;
            
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .authProvider(User.AuthProvider.LOCAL)
                    .emailVerified(false)
                    .verificationToken(verificationToken)
                    .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            
            // Send verification email
            String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
            try {
                emailService.sendVerificationEmail(admin, verificationUrl);
                log.info("✓ Admin user created: {} - Verification email sent successfully", adminEmail);
                log.info("  Check your email inbox and click the verification link to activate your account");
            } catch (Exception e) {
                log.warn("✗ Failed to send verification email to admin: {}", e.getMessage());
                log.warn("  Email configuration may not be set up correctly");
                log.info("  Auto-verifying admin email for first-time setup...");
                
                // Auto-verify admin if email sending fails (for development/first setup)
                admin.setEmailVerified(true);
                admin.setVerificationToken(null);
                admin.setVerificationTokenExpiry(null);
                userRepository.save(admin);
                
                log.info("✓ Admin user created and auto-verified: {}", adminEmail);
                log.info("  You can now log in directly without email verification");
                log.info("  Password: Use the value configured in app.admin.password");
                log.info("  Configure email settings in application.properties for production use");
            }
        } else {
            log.info("Admin user already exists: {}", adminEmail);
        }
    }
}
