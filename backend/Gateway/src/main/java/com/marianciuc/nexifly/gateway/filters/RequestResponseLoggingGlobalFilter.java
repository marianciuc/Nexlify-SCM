package com.marianciuc.nexifly.gateway.filters;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.UUID;

@Component
@Slf4j
public class RequestResponseLoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        String correlationId = Optional.ofNullable(request.getHeaders().getFirst(CORRELATION_ID_HEADER))
                .filter(id -> !id.isBlank())
                .orElse("req-" + UUID.randomUUID().toString().substring(0, 8));

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        exchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, correlationId);

        long startTime = System.currentTimeMillis();
        log.info("[{}] --> {} {}", correlationId, request.getMethod(), request.getURI());

        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .doFinally(signalType -> {
                    long duration = System.currentTimeMillis() - startTime;
                    HttpStatusCode status = exchange.getResponse().getStatusCode();
                    log.info("[{}] <-- {} {} ({} ms)", correlationId, status != null ? status.value() : "-", request.getURI(), duration);
                });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
