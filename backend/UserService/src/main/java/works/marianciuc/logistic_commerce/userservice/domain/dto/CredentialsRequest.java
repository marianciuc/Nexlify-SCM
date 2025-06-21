package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(
    description = "Credentials for login",
    example = "{ \"email\": \"<EMAIL>\", \"password\": \"<PASSWORD>\" }")
public record CredentialsRequest(
    @Schema(description = "User email", example = "<EMAIL>")
        @Email(message = "errors.validation.email.invalid")
        String email,
    @Schema(description = "User password", example = "<PASSWORD>")
        @NotEmpty(message = "errors.validation.blank.password")
        String password)
    implements Serializable {}
