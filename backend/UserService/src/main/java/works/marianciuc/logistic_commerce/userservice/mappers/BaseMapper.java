package works.marianciuc.logistic_commerce.userservice.mappers;

public interface BaseMapper<E, D> {
  E toEntity(D dto);

  D toDto(E entity);
}
