package works.marianciuc.logistic_commerce.userservice.domain.dto.general;

import java.io.Serializable;
import java.util.List;

public record Page<T>(List<T> data, int page, int size, long totalElements)
    implements Serializable {}
