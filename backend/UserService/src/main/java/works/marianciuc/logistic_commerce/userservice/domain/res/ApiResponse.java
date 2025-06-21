package works.marianciuc.logistic_commerce.userservice.domain.res;

public record ApiResponse<T>(boolean success, T data, String error) {
  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, data, null);
  }

  public static <T> ApiResponse<T> error(String error) {
    return new ApiResponse<>(false, null, error);
  }
}
