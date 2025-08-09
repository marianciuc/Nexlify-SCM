# LogisticCommerce Improvement Tasks

This document contains a comprehensive list of improvement tasks for the LogisticCommerce project, organized by priority
level. Each task should be checked off when completed.

## Critical Priority (Security & Data Integrity)

### Security Vulnerabilities

1. [x] **Remove hardcoded secrets from application.yml** - Completed 2025-07-19
    - Move Keycloak client secrets, passwords, and usernames to environment variables or secure vault
    - Update lines 34, 38, 39, 40 in `backend/UserService/src/main/resources/application.yml`
    - Implement proper secret management strategy

2. [x] **Fix database migration syntax errors** - Completed 2025-07-19
    - Remove trailing comma in `V1__create_table_users.sql` line 13
    - Fix CHECK constraint syntax in `V2__create_table_company.sql` line 6 (replace `IN (...)` with proper `CHECK`
      constraint)
    - Correct foreign key constraint in `V2__create_table_company.sql` line 24 (should reference users table, not
      company table)

3. [x] **Implement proper environment-based configuration** - Completed 2025-07-19
    - Replace hardcoded localhost URLs with environment-specific configuration
    - Create application-{profile}.yml files for different environments (dev, staging, prod)
    - Externalize all environment-specific settings

## High Priority (Architecture & Code Quality)

### Code Quality & Consistency

4. [x] **Fix package naming inconsistencies** - Completed 2025-07-19
    - Rename `keyloack` package to `keycloak` throughout the codebase
    - Consolidate `util` and `utils` packages into a single consistent naming convention
    - Update all import statements accordingly

5. [ ] **Fix AccessPermissionCheckerImpl implementation**
    - Implement proper authorization logic instead of always returning true
    - Uncomment and fix the commented-out line that checks if the resource is included in the user's role
    - Add comprehensive tests for different authorization scenarios

6. [ ] **Refactor RealmManagerImpl constructor**
    - Reduce constructor parameters (currently 9 parameters) using Builder pattern or configuration object
    - Consider using `@ConfigurationProperties` for Keycloak settings
    - Improve testability and maintainability

7. [ ] **Add missing Spring annotations**
    - Add `@Service` or `@Component` annotations to service implementations like `RealmManagerImpl`
    - Ensure proper Spring dependency injection throughout the application
    - Review all service classes for missing annotations

8. [ ] **Improve API return types**
    - Fix redundant return type `Page<List<UserDto>>` in `UserManagementService.searchUsers()` method
    - Should be `Page<UserDto>` as Page already contains collection semantics
    - Review other API methods for similar issues

9. [ ] **Clarify method naming**
    - Rename `updateOrChangeRole()` method in `UserManagementService` to be more specific
    - Use either `updateUserRole()` or `changeUserRole()` for clarity
    - Review other ambiguous method names across the codebase

### Exception Handling

10. [ ] **Implement specific exception types**

- Replace generic `RuntimeException` in `RealmManagerImpl` with specific exceptions
- Create custom exceptions for Keycloak operations (e.g., `RealmCreationException`, `RealmDeletionException`)
- Implement proper exception hierarchy

11. [ ] **Add global exception handler**
    - Implement `@ControllerAdvice` for centralized exception handling
    - Provide consistent error response format across all APIs
    - Include proper HTTP status codes and error messages

## Medium Priority (Features & Enhancements)

### Gateway Service Development

12. [ ] **Develop Gateway service functionality**

- Implement routing configuration for microservices
- Add authentication and authorization filters
- Configure load balancing and circuit breaker patterns
- Add request/response logging and monitoring

13. [ ] **Implement API versioning strategy**
    - Add version support in Gateway routing
    - Implement backward compatibility handling
    - Document API versioning guidelines

### Configuration Management

14. [ ] **Complete external service configurations**

- Configure VIES API credentials (currently empty in application.yml)
- Set up proper API key management for external services
- Implement fallback mechanisms for external service failures

15. [ ] **Enhance Consul integration**
    - Implement dynamic configuration refresh
    - Add health checks for service discovery
    - Configure proper service metadata

### Database & Persistence

16. [ ] **Add database connection configuration**

- Configure PostgreSQL connection settings
- Implement connection pooling optimization
- Add database health checks

17. [ ] **Implement database indexing strategy**
    - Add indexes for frequently queried columns (email, company_id, etc.)
    - Optimize query performance
    - Document indexing decisions

### Testing Infrastructure

17. [ ] **Expand test coverage**
    - Add unit tests for service implementations
    - Implement integration tests for Keycloak operations
    - Add contract tests between microservices
    - Target minimum 80% code coverage

18. [ ] **Add test containers for integration testing**
    - Implement TestContainers for PostgreSQL
    - Add Keycloak test container setup
    - Create test data fixtures and utilities

## Low Priority (Documentation & Optimization)

### Documentation

19. [ ] **Add comprehensive API documentation**
    - Complete OpenAPI/Swagger documentation for all endpoints
    - Add request/response examples
    - Document authentication and authorization requirements

20. [ ] **Create architecture documentation**
    - Document microservices communication patterns
    - Create system architecture diagrams
    - Document deployment and infrastructure requirements

21. [ ] **Add JavaDoc documentation**
    - Complete JavaDoc for all public methods and classes
    - Add package-level documentation
    - Document design patterns and architectural decisions

### Performance & Monitoring

22. [ ] **Implement caching strategy**
    - Add Redis caching for frequently accessed data
    - Implement cache invalidation strategies
    - Monitor cache hit rates and performance

23. [ ] **Add application monitoring**
    - Implement Spring Boot Actuator endpoints
    - Add custom metrics for business operations
    - Configure logging levels and structured logging

24. [ ] **Optimize build process**
    - Review Maven dependencies for unused libraries
    - Implement multi-stage Docker builds
    - Add build performance monitoring

### Code Organization

25. [ ] **Implement consistent coding standards**
    - Add Checkstyle or SpotBugs configuration
    - Implement code formatting rules
    - Add pre-commit hooks for code quality

26. [ ] **Refactor large classes and methods**
    - Break down complex service implementations
    - Apply Single Responsibility Principle
    - Improve code readability and maintainability

### DevOps & Deployment

27. [ ] **Implement CI/CD pipeline**
    - Add automated testing in pipeline
    - Implement automated deployment strategies
    - Add security scanning and dependency checks

28. [ ] **Add containerization improvements**
    - Optimize Docker images for production
    - Implement health checks in containers
    - Add proper resource limits and requests

---

## Task Completion Guidelines

- Mark tasks as complete by changing `[ ]` to `[x]`
- Add completion date and notes when marking tasks as done
- Review dependencies between tasks before starting
- Prioritize critical and high-priority tasks first
- Consider creating sub-tasks for complex items

## Notes

- This list was generated on 2025-07-19 based on codebase analysis
- Tasks should be reviewed and updated regularly as the project evolves
- Consider team capacity and project timeline when prioritizing tasks
- Some tasks may require coordination between team members or external dependencies