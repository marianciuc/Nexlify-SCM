package works.marianciuc.logistic_commerce.userservice.generator;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.javapoet.FieldSpec;
import org.springframework.javapoet.JavaFile;
import org.springframework.javapoet.MethodSpec;
import org.springframework.javapoet.TypeSpec;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;

@Slf4j
public class SecurityScopeConstantGenerator {

  private static final String PACKAGE_NAME = SecurityScope.class.getPackageName();
  private static final String CLASS_NAME = SecurityScope.class.getSimpleName() + "Constants";
  private static final String SOURCE_DIR = "src/main/java";

  public static void main(String[] args) {
    log.info(
        "Starting SecurityScopeConstantGenerator generator. Package: {}, class: {}",
        PACKAGE_NAME,
        CLASS_NAME);
    generateClass();
    log.info("Successfully generated {} class", CLASS_NAME);
  }

  private static void generateClass() {
    TypeSpec.Builder classBuilder =
        TypeSpec.classBuilder(CLASS_NAME)
            .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
            .addJavadoc(
                """
                            Auto-generated constants for $S
                            Generated at: $L
                            DO NOT EDIT MANUALLY - Run generator to regenerate
                            """,
                SecurityScope.class.getSimpleName(),
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

    MethodSpec constructor =
        MethodSpec.constructorBuilder()
            .addModifiers(Modifier.PRIVATE)
            .addComment("Utility class")
            .build();
    classBuilder.addMethod(constructor);

    generateScopeConstants(classBuilder);
    TypeSpec generatedClass = classBuilder.build();

    JavaFile javaFile =
        JavaFile.builder(PACKAGE_NAME, generatedClass)
            .addFileComment("This file is auto-generated. Do not edit manually.")
            .build();

    try {
      javaFile.writeTo(Paths.get(SOURCE_DIR));
    } catch (IOException e) {
      log.error("Failed to generate {} class", CLASS_NAME, e);
      throw new RuntimeException(e);
    }
  }

  private static void generateScopeConstants(TypeSpec.Builder classBuilder) {
    getModuleGroups()
        .forEach(
            (module, scopes) -> {
              log.info("Generating constants for module: {}", module);

              // TODO: add comments to group fields by module

              Arrays.stream(scopes)
                  .forEach(
                      scope -> {
                        FieldSpec fieldSpec =
                            FieldSpec.builder(SecurityScope.class, scope.name())
                                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .addJavadoc("$S", scope.getDescription())
                                .initializer("$T.$L", SecurityScope.class, scope.name())
                                .build();
                        classBuilder.addField(fieldSpec);
                      });
            });
  }

  private static Map<String, SecurityScope[]> getModuleGroups() {
    return Arrays.stream(SecurityScope.values())
        .collect(Collectors.groupingBy(scope -> scope.name().substring(0, 7), Collectors.toList()))
        .entrySet()
        .stream()
        .collect(
            Collectors.toMap(
                Map.Entry::getKey, entry -> entry.getValue().toArray(new SecurityScope[0])));
  }
}
