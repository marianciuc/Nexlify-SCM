package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KeycloakTokenResponse(
    String accessToken,
    String refreshToken,
    Long expiresIn,
    Long refreshExpiresIn,
    String tokenType,
    String scope,
    String sessionState)
    implements Serializable {}
