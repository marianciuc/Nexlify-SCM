CREATE TABLE authentication_log
(
    id             UUID                        NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    deleted_at     TIMESTAMP WITHOUT TIME ZONE,
    is_deleted     BOOLEAN                     NOT NULL,
    username       VARCHAR(255)                NOT NULL,
    ip_address     VARCHAR(45)                 NOT NULL,
    timestamp      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    successful     BOOLEAN                     NOT NULL,
    details        VARCHAR(1000),
    user_agent     VARCHAR(255),
    session_id     VARCHAR(100),
    failure_reason VARCHAR(255),
    CONSTRAINT pk_authentication_log PRIMARY KEY (id)
);