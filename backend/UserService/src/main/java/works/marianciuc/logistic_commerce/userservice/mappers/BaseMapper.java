package works.marianciuc.logistic_commerce.userservice.mappers;

/**
 * BaseMapper is a generic interface that defines mapping capabilities between an entity and its
 * corresponding Data Transfer Object (DTO). It provides methods to convert a DTO to an entity and
 * vice versa.
 *
 * @param <E> the type of the entity
 * @param <D> the type of the DTO
 */
public interface BaseMapper<E, D> {
  E toEntity(D dto);

  D toDto(E entity);
}
