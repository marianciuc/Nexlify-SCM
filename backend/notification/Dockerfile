# ==============================================================================
# Build Stage
# ==============================================================================
FROM eclipse-temurin:25-jdk-noble AS builder

WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

COPY src src

RUN ./gradlew bootJar --no-daemon -x test

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

RUN groupadd -r spring --gid=10001 &&     useradd -r -g spring --uid=10001 -d /app -s /sbin/nologin spring &&     chown -R spring:spring /app

USER spring:spring

COPY --from=builder --chown=spring:spring /workspace/build/libs/*.jar app.jar

ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENV SPRING_PROFILES_ACTIVE="prod"

EXPOSE 8087

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
