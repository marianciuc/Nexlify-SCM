package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

@Schema(description = "Error response")
public record ErrorResponse(
    @Schema(description = "Error code", example = "USER_NOT_FOUND") @JsonProperty("error_code")
        String errorCode,
    @Schema(description = "Error message", example = "User with provided credentials not found")
        String message,
    @Schema(description = "HTTP status code", example = "404") Integer status,
    @Schema(description = "Timestamp when error occurred", example = "2024-01-15T10:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp,
    @Schema(description = "Request path where error occurred", example = "/api/v1/auth/login")
        String path) {
  public static ErrorResponse of(BusinessException exception, String path) {
    return new ErrorResponse(
        exception.getErrorCode(),
        exception.getMessage(),
        exception.getStatus().value(),
        LocalDateTime.now(),
        path);
  }
}
