package com.marianciuc.nexifly.users.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filter that parses X-User-Id, X-User-Roles, X-Tenant-Id headers injected by Gateway
 * and populates Spring SecurityContext.
 */
@Component
@Slf4j
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userRoles = request.getHeader("X-User-Roles");
        String tenantId = request.getHeader("X-Tenant-Id");

        if (userId != null && !userId.isBlank()) {
            List<SimpleGrantedAuthority> authorities = List.of();
            if (userRoles != null && !userRoles.isBlank()) {
                authorities = Arrays.stream(userRoles.split(","))
                        .map(String::trim)
                        .filter(r -> !r.isEmpty())
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            authentication.setDetails(tenantId != null ? tenantId : "default");

            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Populated SecurityContext for user: {} with roles: {}", userId, userRoles);
        }

        filterChain.doFilter(request, response);
    }
}
