package com.helpdesk.service;

import com.helpdesk.entity.RefreshToken;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.RefreshTokenRepository;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    
    @Value("${app.jwt.refresh-expiration:604800000}")
    private Long refreshTokenDurationMs;
    
    @Transactional
    public RefreshToken createRefreshToken(Long userId, String deviceInfo, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000))
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired() || token.getIsRevoked()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired or revoked. Please login again.");
        }
        return token;
    }
    
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setIsRevoked(true);
            rt.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(rt);
            log.info("Refresh token revoked: {}", token.substring(0, 10) + "...");
        });
    }
    
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllUserTokens(userId, LocalDateTime.now());
        log.info("All refresh tokens revoked for user: {}", userId);
    }
    
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Expired refresh tokens cleaned up");
    }
}
