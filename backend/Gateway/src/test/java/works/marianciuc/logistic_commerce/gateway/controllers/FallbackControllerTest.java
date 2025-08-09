package works.marianciuc.logistic_commerce.gateway.controllers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FallbackController.class)
class FallbackControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("Should return service unavailable response for user service fallback")
  void shouldReturnServiceUnavailableResponseForUserServiceFallback() throws Exception {
    mockMvc
        .perform(get("/fallback/user-service"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.status", is("error")))
        .andExpect(
            jsonPath(
                "$.message", is("User Service is currently unavailable. Please try again later.")))
        .andExpect(jsonPath("$.code", is("SERVICE_UNAVAILABLE")));
  }

  @Test
  @DisplayName("Should return service unavailable response for any service fallback")
  void shouldReturnServiceUnavailableResponseForAnyServiceFallback() throws Exception {
    mockMvc
        .perform(get("/fallback/unknown-service"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.status", is("error")))
        .andExpect(
            jsonPath(
                "$.message",
                is("The requested service is currently unavailable. Please try again later.")))
        .andExpect(jsonPath("$.code", is("SERVICE_UNAVAILABLE")));
  }

  @Test
  @DisplayName("Should return service unavailable response for root fallback path")
  void shouldReturnServiceUnavailableResponseForRootFallbackPath() throws Exception {
    mockMvc
        .perform(get("/fallback"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.status", is("error")))
        .andExpect(
            jsonPath(
                "$.message",
                is("The requested service is currently unavailable. Please try again later.")))
        .andExpect(jsonPath("$.code", is("SERVICE_UNAVAILABLE")));
  }
}
