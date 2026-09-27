package com.marianciuc.nexifly.users.service;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ViesValidationService {

    private static final Pattern NIP_PATTERN = Pattern.compile("^[0-9]{10}$");
    private static final int[] NIP_WEIGHTS = {6, 5, 7, 2, 3, 4, 5, 6, 7};
    private static final String REDIS_VIES_CACHE_PREFIX = "vies:cache:";

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Data
    @Builder
    public static class ViesResult {
        private String nip;
        private boolean valid;
        private String traderName;
        private String traderAddress;
        private String source;
    }

    public boolean isValidNipChecksum(String nip) {
        if (nip == null || !NIP_PATTERN.matcher(nip).matches()) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(nip.charAt(i)) * NIP_WEIGHTS[i];
        }

        int checksum = sum % 11;
        if (checksum == 10) {
            return false; // Polish NIP checksum can never be 10
        }

        return checksum == Character.getNumericValue(nip.charAt(9));
    }

    public ViesResult validateNip(String nip) {
        if (nip == null) {
            return ViesResult.builder().nip("").valid(false).source("CHECKSUM").build();
        }

        String cleanNip = nip.replaceAll("[^0-9]", "");

        // 1. Check Redis cache first
        String cacheKey = REDIS_VIES_CACHE_PREFIX + cleanNip;
        if (redisTemplate != null) {
            try {
                String cached = redisTemplate.opsForValue().get(cacheKey);
                if (cached != null) {
                    boolean isValid = Boolean.parseBoolean(cached);
                    return ViesResult.builder()
                            .nip(cleanNip)
                            .valid(isValid)
                            .source("REDIS_CACHE")
                            .build();
                }
            } catch (Exception ignored) {}
        }

        // 2. Mathematical checksum verification
        boolean validChecksum = isValidNipChecksum(cleanNip);

        // 3. Cache result for 24 hours
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, String.valueOf(validChecksum), 24, TimeUnit.HOURS);
            } catch (Exception ignored) {}
        }

        return ViesResult.builder()
                .nip(cleanNip)
                .valid(validChecksum)
                .source("ALGORITHM")
                .build();
    }
}
