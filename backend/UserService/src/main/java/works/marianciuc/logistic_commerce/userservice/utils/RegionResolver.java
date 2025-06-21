package works.marianciuc.logistic_commerce.userservice.utils;

import java.util.function.Function;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;

@FunctionalInterface
public interface RegionResolver extends Function<String, Regions> {}
