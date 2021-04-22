CREATE TABLE IF NOT EXISTS users (
    user_id serial PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    roles JSON NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, name, password, roles) VALUES
    ('admin', 'Administrator', '$2b$10$vNvn7F.oXnu2t3R8favFj.Uuk5phURXU0If4JW9mq3jBhp1NO9roi', '["ADMIN"]')
    ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS clients (
    client_id serial PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO clients (client_id, name) VALUES (1, 'Michael')
    ON CONFLICT (client_id) DO NOTHING;

ALTER SEQUENCE clients_client_id_seq RESTART WITH 2;