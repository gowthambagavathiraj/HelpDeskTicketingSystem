package com.helpdesk.service;

import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendTicketAssignmentEmail(User assignee, Ticket ticket) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(assignee.getEmail());
            message.setSubject(String.format("[Helpdesk] Ticket #%d Assigned to You", ticket.getId()));
            message.setText(String.format("""
                    Hello %s,

                    You have been assigned a new support ticket.

                    Ticket Details:
                    ─────────────────────────────────
                    ID:          #%d
                    Title:       %s
                    Priority:    %s
                    Department:  %s
                    Status:      %s
                    ─────────────────────────────────

                    Please log in to the helpdesk portal to view and respond to this ticket.

                    Best regards,
                    Helpdesk System
                    """,
                    assignee.getName(),
                    ticket.getId(),
                    ticket.getTitle(),
                    ticket.getPriority(),
                    ticket.getDepartment().getDepartmentName(),
                    ticket.getStatus()
            ));
            mailSender.send(message);
            log.info("Assignment email sent to {}", assignee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send assignment email to {}: {}", assignee.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendTicketCreatedEmail(User creator, Ticket ticket) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(creator.getEmail());
            message.setSubject(String.format("[Helpdesk] Ticket #%d Created Successfully", ticket.getId()));
            message.setText(String.format("""
                    Hello %s,

                    Your support ticket has been created successfully.

                    Ticket Details:
                    ─────────────────────────────────
                    ID:          #%d
                    Title:       %s
                    Priority:    %s
                    Department:  %s
                    ─────────────────────────────────

                    We will get back to you as soon as possible.

                    Best regards,
                    Helpdesk System
                    """,
                    creator.getName(),
                    ticket.getId(),
                    ticket.getTitle(),
                    ticket.getPriority(),
                    ticket.getDepartment().getDepartmentName()
            ));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send ticket created email: {}", e.getMessage());
        }
    }

    @Async
    public void sendTicketStatusChangeEmail(User user, Ticket ticket, Ticket.Status oldStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject(String.format("[Helpdesk] Ticket #%d Status Updated", ticket.getId()));
            message.setText(String.format("""
                    Hello %s,

                    The status of your ticket has been updated.

                    Ticket Details:
                    ─────────────────────────────────
                    ID:          #%d
                    Title:       %s
                    Old Status:  %s
                    New Status:  %s
                    ─────────────────────────────────

                    Please log in to the helpdesk portal to view the latest updates.

                    Best regards,
                    Helpdesk System
                    """,
                    user.getName(),
                    ticket.getId(),
                    ticket.getTitle(),
                    oldStatus,
                    ticket.getStatus()
            ));
            mailSender.send(message);
            log.info("Status change email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send status change email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendVerificationEmail(User user, String verificationUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("[Helpdesk] Verify Your Email Address");
            message.setText(String.format("""
                    Hello %s,

                    Thank you for registering with our Helpdesk System!

                    Please verify your email address by clicking the link below:
                    %s

                    This link will expire in 24 hours.

                    If you did not create this account, please ignore this email.

                    Best regards,
                    Helpdesk System
                    """,
                    user.getName(),
                    verificationUrl
            ));
            mailSender.send(message);
            log.info("Verification email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String resetUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("[Helpdesk] Password Reset Request");
            message.setText(String.format("""
                    Hello %s,

                    We received a request to reset your password for your Helpdesk account.

                    Click the link below to reset your password:
                    %s

                    This link will expire in 1 hour.

                    If you did not request a password reset, please ignore this email or contact support if you have concerns.

                    Best regards,
                    Helpdesk System
                    """,
                    user.getName(),
                    resetUrl
            ));
            mailSender.send(message);
            log.info("Password reset email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetCodeEmail(User user, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("[Helpdesk] Password Reset Code");
            message.setText(String.format("""
                    Hello %s,

                    We received a request to reset your password for your Helpdesk account.

                    Your password reset code is:

                    %s

                    This code will expire in 1 hour.

                    If you did not request a password reset, please ignore this email or contact support if you have concerns.

                    Best regards,
                    Helpdesk System
                    """,
                    user.getName(),
                    resetCode
            ));
            mailSender.send(message);
            log.info("Password reset code sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset code to {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
