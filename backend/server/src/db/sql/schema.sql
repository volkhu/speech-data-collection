-- Drop old tables
DROP TABLE IF EXISTS recording;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS prompt;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS settings;

-- Create tables
CREATE TABLE settings (
    mobile_app_terms TEXT
);
INSERT INTO settings (mobile_app_terms) VALUES ('');

CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    google_id VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    has_admin_access BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE profile (
    profile_id SERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    year_of_birth INTEGER NOT NULL,
    gender VARCHAR(32) NOT NULL,
    native_language VARCHAR(64),
    dialect VARCHAR(64)
);

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    randomize_prompt_order BOOLEAN NOT NULL DEFAULT FALSE,
    allow_repeated_sessions BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER NOT NULL,
    last_edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_edited_by INTEGER NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES account (account_id),
    FOREIGN KEY (last_edited_by) REFERENCES account (account_id)
);

CREATE TABLE prompt (
    prompt_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    image BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER NOT NULL,
    last_edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_edited_by INTEGER NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NOT NULL,
    instructions VARCHAR(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project (project_id),
    FOREIGN KEY (created_by) REFERENCES account (account_id),
    FOREIGN KEY (last_edited_by) REFERENCES account (account_id)
);
CREATE INDEX ixfk_prompt_project ON prompt (project_id);

CREATE TABLE session (
    session_id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (profile_id) REFERENCES profile (profile_id),
    FOREIGN KEY (project_id) REFERENCES project (project_id)
);
CREATE INDEX ixfk_session_profile ON session (profile_id);
CREATE INDEX ixfk_session_project ON session (project_id);

CREATE TABLE recording (
    recording_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    prompt_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_in_seconds REAL,
    file_size INTEGER,
    FOREIGN KEY (session_id) REFERENCES session (session_id),
    FOREIGN KEY (prompt_id) REFERENCES prompt (prompt_id),
    UNIQUE (session_id, prompt_id)
);
CREATE INDEX ixfk_recording_session ON recording (session_id);
CREATE INDEX ixfk_recording_prompt ON prompt (prompt_id);

-- Grant permissions for newly created tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO speech_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO speech_app;
