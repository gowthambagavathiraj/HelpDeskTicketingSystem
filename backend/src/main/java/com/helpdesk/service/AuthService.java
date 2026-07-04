package com.helpdesk.service;

import com.helpdesk.dto.request.AuthRequest;
import com.helpdesk.dto.response.AuthResponse;
import com.helpdesk.dto.response.DepartmentResponse;
import com.helpdesk.entity.Department;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.DepartmentRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    
    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
        }

        User.Role role = request.getRole() != null ? request.getRole() : User.Role.USER;
        // Prevent self-assigning ADMIN role through registration
        if (role == User.Role.ADMIN) {
            role = User.Role.USER;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .department(department)
                .authProvider(User.AuthProvider.LOCAL)
                .emailVerified(false)
                .verificationToken(java.util.UUID.randomUUID().toString())
                .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                .isActive(true)
                .build();

        userRepository.save(user);
        
        // Send verification email
        String verificationUrl = frontendUrl + "/verify-email?token=" + user.getVerificationToken();
        emailService.sendVerificationEmail(user, verificationUrl);

        String token = generateTokenForUser(user.getEmail());
        return buildAuthResponse(user, token);
    }
    
    @Transactional
    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        
        if (user.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        
        return "Email verified successfully";
    }
    
    @Transactional
    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        user.setVerificationToken(java.util.UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        
        String verificationUrl = frontendUrl + "/verify-email?token=" + user.getVerificationToken();
        emailService.sendVerificationEmail(user, verificationUrl);
        
        return "Verification email sent";
    }
    
    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        // Generate 6-digit reset code
        String resetCode = String.format("%06d", new java.util.Random().nextInt(999999));
        String resetToken = java.util.UUID.randomUUID().toString();
        
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordCode(resetCode);
        user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        // Send reset email with code
        emailService.sendPasswordResetCodeEmail(user, resetCode);
        
        return "Password reset code sent to your email";
    }
    
    @Transactional
    public String verifyResetCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        if (user.getResetPasswordCode() == null || !user.getResetPasswordCode().equals(code)) {
            throw new BadRequestException("Invalid reset code");
        }
        
        if (user.getResetPasswordTokenExpiry() == null || 
            user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Reset code has expired");
        }
        
        // Return the token for password reset
        return user.getResetPasswordToken();
    }
    
    @Transactional
    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        
        if (user.getResetPasswordTokenExpiry() == null || 
            user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordCode(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
        
        return "Password reset successfully";
    }

    public AuthResponse login(AuthRequest.Login request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String token = jwtUtils.generateToken(userDetails);

            return buildAuthResponse(user, token);
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadRequestException("Invalid email or password");
        }
    }

    private String generateTokenForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPassword(),
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()))
                );
        return jwtUtils.generateToken(userDetails);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        DepartmentResponse deptResponse = null;
        if (user.getDepartment() != null) {
            deptResponse = DepartmentResponse.builder()
                    .id(user.getDepartment().getId())
                    .departmentName(user.getDepartment().getDepartmentName())
                    .build();
        }
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(deptResponse)
                .build();
    }
}
