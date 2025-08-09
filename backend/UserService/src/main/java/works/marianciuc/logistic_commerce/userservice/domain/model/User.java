package works.marianciuc.logistic_commerce.userservice.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.enums.AccountStatus;

/** DTO for {@link User} */
@Schema(description = "User")
@JsonIgnoreProperties(ignoreUnknown = true)
public record User(
    @Schema(description = "User id") UUID id,
    @Schema(description = "User creation date") @JsonProperty("created_at") LocalDateTime createdAt,
    @Schema(description = "User update date") @JsonProperty("updated_at") LocalDateTime updatedAt,
    @Schema(description = "Is user deleted", example = "false") @JsonProperty("is_deleted")
        boolean isDeleted,
    @Schema(description = "User email", example = "example@emal.com") @JsonProperty("email")
        String email,
    @Schema(description = "Is user email verified", example = "false")
        @JsonProperty("is_email_verified")
        boolean isEmailVerified,
    @Schema(description = "User first name", example = "John") @JsonProperty("first_name")
        String firstName,
    @Schema(description = "User last name", example = "Doe") @JsonProperty("last_name")
        String lastName,
    @Schema(description = "User contact number", example = "0123456789")
        @JsonProperty("contact_number")
        String contactNumber,
    @Schema(description = "User timezone", example = "Europe/Bucharest") @JsonProperty("timezone")
        String timezone,
    @Schema(description = "User country", example = "Romania") @JsonProperty("country")
        String country,
    @Schema(
            description = "User account status",
            example = "ACTIVE",
            implementation = AccountStatus.class)
        @JsonProperty("account_status")
        AccountStatus accountStatus,
    @Schema(description = "User data processing consent", example = "true")
        @JsonProperty("data_processing_consent")
        boolean dataProcessingConsent)
    implements Serializable {}
