package com.marianciuc.nexifly.integration.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI integrationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nexlify-SCM — Integration & EDI Hub API")
                        .description("Microservice for B2B electronic document exchange (EDIFACT ORDERS, DESADV, INVOIC, Peppol BIS Billing 3.0), batch CSV/Excel catalog synchronization, and ERP Webhooks.")
                        .version("1.0.0")
                        .contact(new Contact().name("Nexlify Enterprise Integration Team").email("integration@nexlify.io"))
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
