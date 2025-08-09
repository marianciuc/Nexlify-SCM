CREATE TABLE users
(
    id                      UUID         NOT NULL,
    created_at              TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at              TIMESTAMP WITHOUT TIME ZONE,
    deleted_at              TIMESTAMP WITHOUT TIME ZONE,
    is_deleted              BOOLEAN      NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    is_email_verified       BOOLEAN      NOT NULL,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    contact_number          VARCHAR(20)  NOT NULL,
    timezone                VARCHAR(100) NOT NULL,
    country                 VARCHAR(50)  NOT NULL,
    account_status          VARCHAR(20)  NOT NULL,
    company_id              UUID,
    data_processing_consent BOOLEAN      NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);