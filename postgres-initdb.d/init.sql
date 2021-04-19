CREATE TABLE IF NOT EXISTS usernames (
    username_id serial PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO usernames (username, password) VALUES
    ('admin', '$2b$10$vNvn7F.oXnu2t3R8favFj.Uuk5phURXU0If4JW9mq3jBhp1NO9roi')
    ON CONFLICT (username) DO NOTHING;
