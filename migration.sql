PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER NOT NULL PRIMARY KEY ASC,
  name STRING NOT NULL,
  username STRING NOT NULL UNIQUE,
  password STRING NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS tg_users_updated_at AFTER UPDATE ON users FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = current_timestamp WHERE user_id = old.user_id;
END;

INSERT OR IGNORE INTO users (user_id, name, username, password) VALUES (1, 'Administrator','admin','$2b$10$vNvn7F.oXnu2t3R8favFj.Uuk5phURXU0If4JW9mq3jBhp1NO9roi');

CREATE TABLE IF NOT EXISTS clients (
  client_id INTEGER NOT NULL PRIMARY KEY ASC,
  name STRING NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS tg_clients_updated_at AFTER UPDATE ON clients FOR EACH ROW
BEGIN
  UPDATE clients SET updated_at = current_timestamp WHERE client_id = old.client_id;
END;

INSERT OR IGNORE INTO clients (client_id, name) VALUES (1, 'Ronaldo Augusto');
INSERT OR IGNORE INTO clients (client_id, name) VALUES (2, 'Mirian Leitão');
INSERT OR IGNORE INTO clients (client_id, name) VALUES (3, 'Cézar Milano');

COMMIT;

CREATE TABLE IF NOT EXISTS integrations (
  integration_id INTEGER NOT NULL PRIMARY KEY,
  name STRING NOT NULL,
  app_id STRING,
  secret_key STRING,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS tg_integrations_updated_at AFTER UPDATE ON integrations FOR EACH ROW
BEGIN
  UPDATE integrations SET updated_at = current_timestamp WHERE integration_id = old.integration_id;
END;
