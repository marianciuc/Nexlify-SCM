# Use OpenJDK 21 as the base image
FROM eclipse-temurin:21-jdk-alpine as build

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make the Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

# Create a smaller runtime image
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Add a non-root user to run the application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE="prod"

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]