package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Token pair containing access and refresh tokens")
public record TokenPair(
    @Schema(
            description = "Access token for API authentication",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        @JsonProperty("access_token")
        String accessToken,
    @Schema(
            description = "Refresh token for obtaining new access tokens",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        @JsonProperty("refresh_token")
        String refreshToken,
    @Schema(description = "Access token expiration time in seconds", example = "3600")
        @JsonProperty("expires_in")
        Long accessExpiresIn) {}
