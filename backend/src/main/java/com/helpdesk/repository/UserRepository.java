package com.helpdesk.repository;

import com.helpdesk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetPasswordToken(String token);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(User.Role role);
    java.util.List<User> findByDepartmentId(Long departmentId);
    long countByRole(User.Role role);
}
