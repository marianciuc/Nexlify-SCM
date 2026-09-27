package com.marianciuc.nexifly.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.users.domain.dto.RefreshData;
import com.marianciuc.nexifly.users.domain.dto.SessionData;
import com.marianciuc.nexifly.users.domain.dto.response.UserProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Service managing opaque reference tokens.
 * Employs the Phantom Token / Opaque Token pattern:
 * Clients receive opaque tokens (opq_acc_...) while internal
 * services receive verified identity and downstream headers.
 */
@Service
@Slf4j
public class OpaqueTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    public static final String ACCESS_TOKEN_PREFIX = "opq_acc_";
    public static final String REFRESH_TOKEN_PREFIX = "opq_ref_";
    public static final String REDIS_OPAQUE_ACCESS_PREFIX = "opaque:access:";
    public static final String REDIS_OPAQUE_REFRESH_PREFIX = "opaque:refresh:";
    public static final String REDIS_LEGACY_ACCESS_PREFIX = "session:acc:";
    public static final String REDIS_LEGACY_REFRESH_PREFIX = "session:ref:";

    public static final long ACCESS_TOKEN_VALIDITY_SECONDS = 900; // 15 minutes
    public static final long REFRESH_TOKEN_VALIDITY_SECONDS = 86400; // 24 hours

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    private RedissonClient redissonClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, OpaqueSession> accessTokens = new ConcurrentHashMap<>();
    private final Map<String, OpaqueSession> refreshTokens = new ConcurrentHashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpaqueSession {
        private String accessToken;
        private String refreshToken;
        private UUID userId;
        private String email;
        private String firstName;
        private String lastName;
        private UUID companyId;
        private String companyName;
        private List<String> roles;
        private List<String> securityScopes;
        private String keycloakJwt;
        private Instant expiresAt;
        private Instant refreshExpiresAt;

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }

        public boolean isRefreshExpired() {
            return Instant.now().isAfter(refreshExpiresAt);
        }

        public UserProfileResponse toProfileResponse() {
            return UserProfileResponse.builder()
                    .id(userId)
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .companyId(companyId)
                    .companyName(companyName)
                    .roles(roles)
                    .securityScopes(securityScopes)
                    .build();
        }

        public SessionData toSessionData() {
            return new SessionData(
                    userId,
                    email,
                    firstName,
                    lastName,
                    companyId,
                    companyName,
                    roles,
                    securityScopes,
                    "development",
                    keycloakJwt
            );
        }
    }

    public OpaqueSession createSession(
            UUID userId,
            String email,
            String firstName,
            String lastName,
            UUID companyId,
            String companyName,
            List<String> roles,
            List<String> securityScopes,
            String keycloakJwt
    ) {
        String accessToken = generateOpaqueToken(ACCESS_TOKEN_PREFIX);
        String refreshToken = generateOpaqueToken(REFRESH_TOKEN_PREFIX);
        Instant now = Instant.now();

        List<String> effectiveRoles = (roles != null && !roles.isEmpty())
                ? new ArrayList<>(roles)
                : new ArrayList<>(List.of("ADMIN", "USER"));

        List<String> effectiveScopes = (securityScopes != null && !securityScopes.isEmpty())
                ? new ArrayList<>(securityScopes)
                : new ArrayList<>(List.of("MOD_001_001", "MOD_001_002", "MOD_002_001", "MOD_003_001", "MOD_004_001", "MOD_005_001"));

        OpaqueSession session = OpaqueSession.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userId != null ? userId : UUID.randomUUID())
                .email(email)
                .firstName(firstName != null ? firstName : "User")
                .lastName(lastName != null ? lastName : "")
                .companyId(companyId != null ? companyId : UUID.randomUUID())
                .companyName(companyName != null ? companyName : "Nexlify Enterprise")
                .roles(effectiveRoles)
                .securityScopes(effectiveScopes)
                .keycloakJwt(keycloakJwt)
                .expiresAt(now.plus(ACCESS_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                .refreshExpiresAt(now.plus(REFRESH_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                .build();

        accessTokens.put(accessToken, session);
        refreshTokens.put(refreshToken, session);
        persistSessionToRedis(session);
        log.info("Created new opaque session for user: {}, accessToken: {}...", email, accessToken.substring(0, Math.min(16, accessToken.length())));
        return session;
    }

    public Optional<OpaqueSession> getSessionByAccessToken(String token) {
        if (token == null) return Optional.empty();
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
        OpaqueSession session = accessTokens.get(cleanToken);
        if (session != null) {
            if (session.isExpired()) {
                accessTokens.remove(cleanToken);
                return Optional.empty();
            }
            return Optional.of(session);
        }

        // Try restoring from Redis
        try {
            String accKey = REDIS_OPAQUE_ACCESS_PREFIX + cleanToken;
            String payload = null;

            if (redisTemplate != null) {
                payload = redisTemplate.opsForValue().get(accKey);
                if (payload == null) {
                    payload = redisTemplate.opsForValue().get(REDIS_LEGACY_ACCESS_PREFIX + cleanToken);
                }
            } else if (redissonClient != null) {
                RBucket<String> bucket = redissonClient.getBucket(accKey);
                payload = bucket.get();
            }

            if (payload != null && !payload.isBlank()) {
                OpaqueSession restored = parseSessionFromPayload(cleanToken, payload);
                if (restored != null) {
                    accessTokens.put(cleanToken, restored);
                    log.info("Restored opaque session from Redis for user: {}", restored.getEmail());
                    return Optional.of(restored);
                }
            }
        } catch (Exception e) {
            log.warn("Redis session lookup failed: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<OpaqueSession> refreshSession(String refreshToken) {
        if (refreshToken == null) return Optional.empty();
        String cleanToken = refreshToken.trim();
        OpaqueSession existing = refreshTokens.get(cleanToken);

        if (existing == null) {
            // Try loading from Redis
            try {
                String refKey = REDIS_OPAQUE_REFRESH_PREFIX + cleanToken;
                String payload = null;
                if (redisTemplate != null) {
                    payload = redisTemplate.opsForValue().get(refKey);
                } else if (redissonClient != null) {
                    RBucket<String> bucket = redissonClient.getBucket(refKey);
                    payload = bucket.get();
                }

                if (payload != null && !payload.isBlank()) {
                    RefreshData refreshData = objectMapper.readValue(payload, RefreshData.class);
                    existing = OpaqueSession.builder()
                            .refreshToken(cleanToken)
                            .userId(refreshData.userId())
                            .companyId(refreshData.companyId())
                            .email(refreshData.email())
                            .firstName(refreshData.firstName())
                            .lastName(refreshData.lastName())
                            .companyName(refreshData.companyName())
                            .roles(refreshData.roles())
                            .securityScopes(refreshData.securityScopes())
                            .keycloakJwt(refreshData.keycloakRefreshToken())
                            .expiresAt(Instant.now().plus(ACCESS_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                            .refreshExpiresAt(Instant.now().plus(REFRESH_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                            .build();
                }
            } catch (Exception e) {
                log.warn("Failed to restore refresh token from Redis: {}", e.getMessage());
            }
        }

        if (existing == null || existing.isRefreshExpired()) {
            return Optional.empty();
        }

        // Invalidate old tokens
        if (existing.getAccessToken() != null) {
            accessTokens.remove(existing.getAccessToken());
        }
        refreshTokens.remove(cleanToken);
        deleteFromRedis(existing.getAccessToken(), cleanToken);

        // Create refreshed session
        return Optional.of(createSession(
                existing.getUserId(),
                existing.getEmail(),
                existing.getFirstName(),
                existing.getLastName(),
                existing.getCompanyId(),
                existing.getCompanyName(),
                existing.getRoles(),
                existing.getSecurityScopes(),
                existing.getKeycloakJwt()
        ));
    }

    public void revoke(String token) {
        if (token == null) return;
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
        OpaqueSession session = accessTokens.remove(cleanToken);
        String refreshToken = null;
        if (session != null) {
            refreshToken = session.getRefreshToken();
            refreshTokens.remove(refreshToken);
            log.info("Revoked opaque session for user: {}", session.getEmail());
        }

        deleteFromRedis(cleanToken, refreshToken);
    }

    private void persistSessionToRedis(OpaqueSession session) {
        try {
            SessionData sessionData = session.toSessionData();
            String sessionJson = objectMapper.writeValueAsString(sessionData);

            RefreshData refreshData = new RefreshData(
                    session.getUserId(),
                    session.getCompanyId(),
                    session.getEmail(),
                    session.getFirstName(),
                    session.getLastName(),
                    session.getCompanyName(),
                    session.getRoles(),
                    session.getSecurityScopes(),
                    session.getKeycloakJwt()
            );
            String refreshJson = objectMapper.writeValueAsString(refreshData);

            String accKey = REDIS_OPAQUE_ACCESS_PREFIX + session.getAccessToken();
            String refKey = REDIS_OPAQUE_REFRESH_PREFIX + session.getRefreshToken();

            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(accKey, sessionJson, ACCESS_TOKEN_VALIDITY_SECONDS, TimeUnit.SECONDS);
                redisTemplate.opsForValue().set(refKey, refreshJson, REFRESH_TOKEN_VALIDITY_SECONDS, TimeUnit.SECONDS);
                // Also persist legacy key for backward compatibility
                redisTemplate.opsForValue().set(REDIS_LEGACY_ACCESS_PREFIX + session.getAccessToken(), sessionJson, ACCESS_TOKEN_VALIDITY_SECONDS, TimeUnit.SECONDS);
                log.info("Persisted session to Redis via StringRedisTemplate (accKey: {})", accKey);
            } else if (redissonClient != null) {
                RBucket<String> accBucket = redissonClient.getBucket(accKey);
                accBucket.set(sessionJson, Duration.ofSeconds(ACCESS_TOKEN_VALIDITY_SECONDS));

                RBucket<String> refBucket = redissonClient.getBucket(refKey);
                refBucket.set(refreshJson, Duration.ofSeconds(REFRESH_TOKEN_VALIDITY_SECONDS));
                log.info("Persisted session to Redis via Redisson (accKey: {})", accKey);
            }
        } catch (Exception e) {
            log.warn("Redis session persistence skipped ({})", e.getMessage());
        }
    }

    private void deleteFromRedis(String accessToken, String refreshToken) {
        try {
            if (redisTemplate != null) {
                if (accessToken != null) {
                    redisTemplate.delete(REDIS_OPAQUE_ACCESS_PREFIX + accessToken);
                    redisTemplate.delete(REDIS_LEGACY_ACCESS_PREFIX + accessToken);
                }
                if (refreshToken != null) {
                    redisTemplate.delete(REDIS_OPAQUE_REFRESH_PREFIX + refreshToken);
                    redisTemplate.delete(REDIS_LEGACY_REFRESH_PREFIX + refreshToken);
                }
            } else if (redissonClient != null) {
                if (accessToken != null) {
                    redissonClient.getBucket(REDIS_OPAQUE_ACCESS_PREFIX + accessToken).delete();
                }
                if (refreshToken != null) {
                    redissonClient.getBucket(REDIS_OPAQUE_REFRESH_PREFIX + refreshToken).delete();
                }
            }
        } catch (Exception ignored) {}
    }

    private OpaqueSession parseSessionFromPayload(String token, String payload) {
        try {
            if (payload.trim().startsWith("{")) {
                SessionData data = objectMapper.readValue(payload, SessionData.class);
                return OpaqueSession.builder()
                        .accessToken(token)
                        .userId(data.userId())
                        .email(data.email())
                        .firstName(data.firstName())
                        .lastName(data.lastName())
                        .companyId(data.companyId())
                        .companyName(data.companyName())
                        .roles(data.roles())
                        .securityScopes(data.securityScopes())
                        .keycloakJwt(data.keycloakJwt())
                        .expiresAt(Instant.now().plus(ACCESS_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                        .build();
            }

            // Fallback for pipe separated format
            String[] parts = payload.split("\\|", 7);
            if (parts.length >= 6) {
                return OpaqueSession.builder()
                        .accessToken(token)
                        .userId(UUID.fromString(parts[0]))
                        .email(parts[1])
                        .firstName(parts[2])
                        .lastName(parts[3])
                        .companyId(UUID.fromString(parts[4]))
                        .companyName(parts[5])
                        .keycloakJwt(parts.length > 6 ? parts[6] : null)
                        .roles(List.of("ADMIN", "USER"))
                        .securityScopes(List.of("MOD_001_001", "MOD_001_002"))
                        .expiresAt(Instant.now().plus(ACCESS_TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                        .build();
            }
        } catch (Exception e) {
            log.warn("Error parsing session payload: {}", e.getMessage());
        }
        return null;
    }

    private String generateOpaqueToken(String prefix) {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return prefix + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
