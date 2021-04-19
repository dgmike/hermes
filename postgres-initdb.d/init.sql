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
    ('admin', 'Administrator', '$2b$10$vNvn7F.oXnu2t3R8favFj.Uuk5phURXU0If4JW9mq3jBhp1NO9roi', '["admin"]')
    ON CONFLICT (username) DO NOTHING;
