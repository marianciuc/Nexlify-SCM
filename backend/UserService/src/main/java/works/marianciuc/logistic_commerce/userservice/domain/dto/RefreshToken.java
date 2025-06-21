package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Represents a response containing a refresh token.
 *
 * <p>This record encapsulates the refresh token field, which is used to generate new access tokens
 * without requiring the user's credentials again.
 *
 * <p>The refresh token must not be null or empty to ensure proper functionality and is validated
 * upon initialization.
 *
 * <p>Example serialized form: { "refreshToken": "<KEY>" }
 */
@Schema(description = "Response for refresh token", example = "{ \"refreshToken\": \"<KEY> }")
@JsonIgnoreProperties(ignoreUnknown = true)
public record RefreshToken(
    @Schema(description = "Refresh token", example = "<KEY>")
        @JsonProperty("refresh_token")
        @NotNull(message = "errors.validation.required")
        @NotEmpty(message = "errors.validation.required")
        String refreshToken) {}
