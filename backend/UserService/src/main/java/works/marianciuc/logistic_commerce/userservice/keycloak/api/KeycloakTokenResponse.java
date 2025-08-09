package works.marianciuc.logistic_commerce.userservice.keycloak.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KeycloakTokenResponse(
    @JsonProperty("access_token") String accessToken,
    @JsonProperty("refresh_token") String refreshToken,
    @JsonProperty("expires_in") Long expiresIn,
    @JsonProperty("refresh_expires_in") Long refreshExpiresIn,
    @JsonProperty("token_type") String tokenType,
    @JsonProperty("scope") String scope)
    implements Serializable {}
