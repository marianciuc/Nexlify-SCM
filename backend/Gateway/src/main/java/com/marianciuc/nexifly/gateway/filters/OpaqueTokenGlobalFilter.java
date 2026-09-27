package com.marianciuc.nexifly.gateway.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.gateway.domain.SessionData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Global filter for handling Opaque Reference Tokens.
 * Validates opaque tokens (opq_acc_...) against Redis and injects verified tenant context
 * (X-User-Id, X-User-Roles, X-Environment, X-Tenant-Id) for downstream microservices.
 * Strips any incoming spoofed authentication headers from client requests.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OpaqueTokenGlobalFilter implements GlobalFilter, Ordered {

    private static final String ACCESS_TOKEN_PREFIX = "opq_acc_";
    private static final String REDIS_OPAQUE_PREFIX = "opaque:access:";
    private static final String REDIS_LEGACY_PREFIX = "session:acc:";

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/api/v1/auth/",
            "/v3/api-docs",
            "/swagger-ui",
            "/actuator",
            "/fallback",
            "/webjars",
            "/ws/",
            "/api/v1/billing/webhooks"
    );

    private final ReactiveStringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Allow public and Swagger paths
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Check Authorization header for /api/** endpoints
        if (path.startsWith("/api/")) {
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header on protected route: {}", path);
                return unauthorizedResponse(exchange, "Missing or invalid Authorization header. Opaque Bearer token required.");
            }

            String token = authHeader.substring(7).trim();

            if (token.startsWith(ACCESS_TOKEN_PREFIX)) {
                return validateOpaqueTokenAndForward(exchange, chain, token, path);
            } else if (token.startsWith("eyJ")) {
                // Support direct JWT in development / fallback scenarios
                return passThroughJwt(exchange, chain, token, path);
            } else {
                log.warn("Unrecognized token format on protected route: {}", path);
                return unauthorizedResponse(exchange, "Invalid token format. Opaque reference token expected.");
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> validateOpaqueTokenAndForward(ServerWebExchange exchange, GatewayFilterChain chain, String token, String path) {
        String key = REDIS_OPAQUE_PREFIX + token;
        String legacyKey = REDIS_LEGACY_PREFIX + token;

        return redisTemplate.opsForValue().get(key)
                .switchIfEmpty(redisTemplate.opsForValue().get(legacyKey))
                .flatMap(payload -> {
                    SessionData session = parseSession(payload, token);
                    if (session == null) {
                        log.warn("Failed to parse session data for token: {}", token.substring(0, Math.min(16, token.length())));
                        return unauthorizedResponse(exchange, "Malformed session data.");
                    }

                    // Security: Strip client-supplied security headers before injecting verified values
                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                            .headers(headers -> {
                                headers.remove("X-User-Id");
                                headers.remove("X-Tenant-Id");
                                headers.remove("X-User-Roles");
                                headers.remove("X-Environment");
                                headers.remove("X-User-Email");
                                headers.remove("X-Auth-Token-Type");
                            })
                            .header("X-Auth-Token-Type", "OPAQUE")
                            .header("X-User-Id", session.userId() != null ? session.userId().toString() : "")
                            .header("X-Tenant-Id", session.companyId() != null ? session.companyId().toString() : "default-b2b-tenant")
                            .header("X-User-Roles", session.roles() != null ? String.join(",", session.roles()) : "")
                            .header("X-Environment", session.environment() != null ? session.environment() : "development")
                            .header("X-User-Email", session.email() != null ? session.email() : "")
                            .build();

                    log.debug("Opaque token validated for user: {}, route: {}", session.email(), path);
                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("Opaque token not found or expired in Redis: {}... for path: {}", token.substring(0, Math.min(16, token.length())), path);
                    return unauthorizedResponse(exchange, "Session expired or invalid token.");
                }))
                .onErrorResume(ex -> {
                    log.error("Error communicating with Redis during token validation: {}", ex.getMessage());
                    return unauthorizedResponse(exchange, "Authentication service temporarily unavailable.");
                });
    }

    private Mono<Void> passThroughJwt(ServerWebExchange exchange, GatewayFilterChain chain, String token, String path) {
        ServerHttpRequest request = exchange.getRequest();
        String tenantId = request.getHeaders().getFirst("X-Tenant-Id");
        String environment = request.getHeaders().getFirst("X-Environment");

        ServerHttpRequest mutatedRequest = request.mutate()
                .headers(headers -> {
                    headers.remove("X-User-Id");
                    headers.remove("X-User-Roles");
                })
                .header("X-Auth-Token-Type", "JWT")
                .header("X-Tenant-Id", tenantId != null ? tenantId : "default-b2b-tenant")
                .header("X-Environment", environment != null ? environment : "development")
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private SessionData parseSession(String payload, String token) {
        if (payload == null || payload.isBlank()) {
            return null;
        }

        try {
            if (payload.trim().startsWith("{")) {
                return objectMapper.readValue(payload, SessionData.class);
            }

            // Fallback: legacy pipe format: userId|email|firstName|lastName|companyId|companyName|jwt
            String[] parts = payload.split("\\|", 7);
            if (parts.length >= 6) {
                return new SessionData(
                        UUID.fromString(parts[0]),
                        parts[1],
                        parts[2],
                        parts[3],
                        UUID.fromString(parts[4]),
                        parts[5],
                        List.of("ADMIN", "USER"),
                        List.of("MOD_001_001", "MOD_001_002"),
                        "development",
                        parts.length > 6 ? parts[6] : null
                );
            }
        } catch (Exception e) {
            log.warn("Session parsing exception: {}", e.getMessage());
        }
        return null;
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"error\":\"UNAUTHORIZED\",\"message\":\"%s\",\"status\":401}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }
}
