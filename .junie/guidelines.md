# LogisticCommerce Project Development Guidelines

## Project Overview

LogisticCommerce is a microservices-based logistics and commerce platform built with Spring Boot and Spring Cloud. The
project consists of multiple backend services including UserService and Gateway, with a frontend component.

## Build/Configuration Instructions

### Prerequisites

- **Java 21** - The project uses Java 21 as specified in the Maven configuration
- **Maven** - Build tool for the backend services
- **PostgreSQL** - Database for the UserService
- **Keycloak** - Identity and access management server (runs on port 9090)
- **Consul** - Service discovery and configuration management (runs on port 8500)

### Project Structure

```
LogisticCommerce/
├── backend/
│   ├── UserService/          # User management microservice
│   └── Gateway/              # API Gateway service
├── frontend/                 # Frontend application
└── http/                     # HTTP request collections
```

### UserService Configuration

The UserService is a Spring Boot application with the following key dependencies:

- **Spring Boot 3.5.0** with Spring Cloud 2025.0.0
- **Spring Security** with OAuth2 Resource Server
- **Keycloak Admin Client 26.0.5** for user management
- **Spring Data JPA** with PostgreSQL
- **Flyway** for database migrations
- **Spring Cloud Consul** for service discovery and configuration
- **MapStruct 1.5.5.Final** for object mapping
- **Lombok** for reducing boilerplate code
- **SpringDoc OpenAPI 2.2.0** for API documentation

### Gateway Configuration

The Gateway service is a Spring Boot application with the following key dependencies:

- **Spring Boot 3.5.0** with Spring Cloud 2025.0.0
- **Spring Cloud Gateway Server WebMVC** for API gateway functionality
- **Spring Security** with OAuth2 Resource Server
- **Spring Cloud Consul** for service discovery and configuration
- **Resilience4j** for circuit breaker patterns
- **Micrometer** for metrics and observability
- **Zipkin** for distributed tracing
- **Caffeine Cache** for load balancer caching
- **SpringDoc OpenAPI 2.2.0** for API documentation

### Build Commands

To build the UserService:

```bash
cd backend/UserService
./mvnw clean compile
```

To build the Gateway:

```bash
cd backend/Gateway
./mvnw clean compile
```

To package the application:

```bash
./mvnw clean package
```

### Configuration Files

The application uses `application.yml` for configuration with the following key settings:

- **Service Name**: `user-service`
- **Consul**: localhost:8500 for service discovery and configuration
- **Keycloak**: localhost:9090 with realm `LogisticCommerce`
- **Database**: PostgreSQL with Flyway migrations
- **OAuth2**: JWT token validation through Keycloak

### Database Setup

The project uses Flyway for database migrations. Migration files are located in:

```
src/main/resources/db/migration/
```

Key tables:

- `users` - User information with company associations
- `company` - Company details with verification status and ratings

**Note**: There are syntax issues in the current migration files that need to be addressed:

- V1__create_table_users.sql has a trailing comma
- V2__create_table_company.sql has an incorrect foreign key constraint

### External Services Setup

1. **Keycloak Server**:
    - URL: http://localhost:9090
    - Default realm: `scm`
    - Admin realm: `master`
    - The application includes initialization logic for realms and roles

2. **Consul Server**:
    - URL: http://localhost:8500
    - Used for service discovery and configuration management

3. **PostgreSQL Database**:
    - Configure connection details through Consul or application properties

## Testing Information

### Testing Framework

The project uses **JUnit 5 (Jupiter)** as the primary testing framework with Spring Boot Test for integration testing.

### Test Structure

Tests are organized following Maven conventions:

```
src/test/java/works/marianciuc/logistic_commerce/userservice/
```

### Running Tests

#### Using the Environment Test Runner

To run a specific test class:

```bash
# Use the run_test function with the full path to the test file
run_test backend/UserService/src/test/java/works/marianciuc/logistic_commerce/userservice/util/StringUtilsTest.java
```

To run all tests in the UserService:

```bash
run_test backend/UserService/src/test/java/works/marianciuc/logistic_commerce/userservice/
```

You can enhance debugging by adding logging to your tests:

- Always start debug messages with `[DEBUG_LOG]` prefix
- Java: `System.out.println("[DEBUG_LOG] Your message here")`
- Kotlin: `println("[DEBUG_LOG] Your message here")`

#### Using Maven (if available)

```bash
cd backend/UserService
mvn test                                    # Run all tests
mvn test -Dtest=StringUtilsTest            # Run specific test class
mvn test -Dtest=StringUtilsTest#testMethod # Run specific test method
```

### Writing Tests

#### Basic Test Structure

```java
package works.marianciuc.logistic_commerce.userservice.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("String Utilities Test")
class StringUtilsTest {

    @Test
    @DisplayName("Should check if string is not null or empty")
    void shouldCheckIfStringIsNotNullOrEmpty() {
        // Arrange
        String validString = "test"; String emptyString = ""; String nullString = null;

        // Act & Assert
        assertTrue(isNotNullOrEmpty(validString)); assertFalse(isNotNullOrEmpty(emptyString));
        assertFalse(isNotNullOrEmpty(nullString));

        System.out.println("[DEBUG_LOG] String validation test completed successfully");
    }

    @ParameterizedTest
    @DisplayName("Should handle multiple valid inputs")
    @ValueSource(strings = {"hello", "world", "test123", "Spring Boot"})
    void shouldHandleMultipleValidInputs(String input) {
        // Test logic here
        assertNotNull(input); assertTrue(input.length() > 0); assertTrue(isNotNullOrEmpty(input));

        System.out.println("[DEBUG_LOG] Testing input: " + input);
    }

    // Utility methods for testing
    private boolean isNotNullOrEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
```

#### Spring Boot Integration Tests

For testing Spring components:

```java

@SpringBootTest
class ServiceIntegrationTest {

    @Autowired private YourService yourService;

    @Test
    void shouldTestServiceIntegration() {
        // Test Spring-managed components
    }
}
```

#### Test Naming Conventions

- Use descriptive method names following the pattern: `should[ExpectedBehavior]_When[StateUnderTest]`
- Use `@DisplayName` annotations for human-readable test descriptions
- Follow the Arrange-Act-Assert pattern in test methods

### Adding New Tests

1. Create test classes in the corresponding package under `src/test/java/`
2. Use the same package structure as the main source code
3. Name test classes with the `Test` suffix (e.g., `UserServiceTest`)
4. Use appropriate JUnit 5 annotations and assertions
5. Consider using parameterized tests for testing multiple scenarios

## Additional Development Information

### Code Generation

The project includes a custom code generation step that runs during the Maven build process:

- **SecurityScopeConstantGenerator** - Generates security scope constants during the `process-classes` phase

### Key Dependencies and Their Usage

- **MapStruct**: Used for object mapping between DTOs and entities
- **Lombok**: Reduces boilerplate code with annotations like `@Data`, `@Builder`, etc.
- **VIES API Client**: For VAT number validation in EU
- **IP API**: For IP geolocation services

### Security Configuration

- The application is configured as an OAuth2 Resource Server
- JWT tokens are validated against Keycloak
- Access and refresh token lifetimes are configurable
- Role-based access control is implemented through Keycloak

### Service Discovery

- Uses Spring Cloud Consul for service registration and discovery
- Configuration is externalized through Consul's key-value store
- Service name: `user-service`

### API Documentation

- SpringDoc OpenAPI is configured for automatic API documentation
- Documentation should be available at `/swagger-ui.html` when the application is running

### Development Best Practices

1. **Configuration**: Use Consul for externalized configuration in distributed environments
2. **Database Changes**: Always use Flyway migrations for database schema changes
3. **Security**: Implement proper OAuth2 scopes and role-based access control
4. **Testing**: Write comprehensive tests including unit tests and integration tests
5. **Documentation**: Keep API documentation up-to-date using SpringDoc annotations

### Known Issues

1. **Database Migration Files**: Current migration files contain syntax errors that need to be fixed
2. **Maven Availability**: The development environment may not have Maven in PATH - use the provided `run_test` function
   for testing

### Debugging Tips

- Use `@Slf4j` (Lombok) for logging
- Configure appropriate log levels in `application.yml`
- Use Spring Boot Actuator endpoints for monitoring (if enabled)
- Leverage Spring Boot DevTools for faster development cycles
