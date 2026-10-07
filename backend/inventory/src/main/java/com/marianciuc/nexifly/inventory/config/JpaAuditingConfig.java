package com.marianciuc.nexifly.inventory.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA Auditing Configuration.
 * Automatically populates auditing metadata (@CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy)
 * so entity lifecycle timestamps/auditors do not need to be manually updated in code or @PrePersist callbacks.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
                return Optional.of("system");
            }
            return Optional.ofNullable(authentication.getName());
        };
    }
}
