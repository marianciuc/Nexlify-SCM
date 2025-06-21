package works.marianciuc.logistic_commerce.userservice.domain.dto;

import java.io.Serializable;

public record Page<T>(T data, int page, int size, long totalElements) implements Serializable {}
