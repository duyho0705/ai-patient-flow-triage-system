package vn.clinic.cdm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) metadata.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Patient Flow & Triage API")
                        .description("AI-powered patient flow and triage for clinics (Vietnam). Modular monolith.")
                        .version("0.1.0")
                        .contact(new Contact()
                                .name("Clinic Backend")));
    }
}

