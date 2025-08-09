ALTER TABLE companies
    ADD CONSTRAINT uc_companies_email UNIQUE (email);

ALTER TABLE companies
    ADD CONSTRAINT uc_companies_tax UNIQUE (tax_id);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);

CREATE INDEX idx_auth_logs_ip_address ON authentication_log (ip_address);

CREATE INDEX idx_auth_logs_successful ON authentication_log (successful);

CREATE INDEX idx_auth_logs_timestamp ON authentication_log (timestamp);

CREATE INDEX idx_auth_logs_username ON authentication_log (username);

CREATE INDEX idx_user_email ON users (email);

CREATE INDEX idx_user_status ON users (account_status);

ALTER TABLE users
    ADD CONSTRAINT FK_USERS_ON_COMPANY FOREIGN KEY (company_id) REFERENCES companies (id);

CREATE INDEX idx_user_company ON users (company_id);