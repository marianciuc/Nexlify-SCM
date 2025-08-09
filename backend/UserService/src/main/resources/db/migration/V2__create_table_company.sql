CREATE TABLE companies
(
    id                  UUID                        NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    is_deleted          BOOLEAN                     NOT NULL,
    legal_name          VARCHAR(255)                NOT NULL,
    tax_id              VARCHAR(255),
    email               VARCHAR(255)                NOT NULL,
    verification_status VARCHAR(255),
    rating              DOUBLE PRECISION,
    number_of_orders    BIGINT,
    number_of_ratings   BIGINT,
    street              VARCHAR(255),
    city                VARCHAR(255),
    house_number        VARCHAR(255),
    street_number       VARCHAR(255),
    zip_code            VARCHAR(255),
    country             VARCHAR(255),
    CONSTRAINT pk_companies PRIMARY KEY (id)
);