-- Drop old tables
DROP TABLE IF EXISTS recording;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS prompt;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS profile;

-- Create tables
CREATE TABLE profile (
    profile_id SERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    year_of_birth INTEGER NOT NULL,
    gender CHAR(1) NOT NULL,
    native_language VARCHAR(64),
    dialect VARCHAR(64)
);

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    randomize_prompt_order BOOLEAN NOT NULL DEFAULT FALSE,
    allow_concurrent_sessions BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT
);

CREATE TABLE prompt (
    prompt_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    description VARCHAR(255) NOT NULL,
    image BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    instructions VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES project (project_id)
);
CREATE INDEX ixfk_prompt_project ON prompt (project_id);

CREATE TABLE session (
    session_id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
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
    UNIQUE (session_id, prompt_id)
);
CREATE INDEX ixfk_recording_session ON recording (session_id);

-- Profile test data
INSERT INTO profile (device_id, year_of_birth, gender, native_language) VALUES(
    'albcpk2qisnlr9kdn7pnfg742w2v5qbm', 1985, 'M', 'Eesti'
);
INSERT INTO profile (device_id, year_of_birth, gender, native_language, dialect) VALUES (
    'ghcvyhg17923791vg9cvcv12sda8yddw', 1985, 'M', 'Eesti', 'Võru'
);

-- Project test data
INSERT INTO project (name, active, description) VALUES (
    'Kõnenäidete kogumise eksperiment',
    TRUE,
    'Projekt rakenduse kasutusmugavuse hindamiseks.'
);
INSERT INTO project (name, active, description) VALUES (
    'Speech data collection project',
    TRUE,
    'Project for collecting speech data.'
);

-- Prompt test data
INSERT INTO prompt (project_id, instructions, description) VALUES (
    1,
    'Palun lugege järgnev tekst',
    'The quick brown fox jumps over the lazy dog'
);
INSERT INTO prompt (project_id, instructions, description) VALUES (
    2,
    'Palun lugege järgnev peatükk',
    'Praesent id pellentesque orci'
);
INSERT INTO prompt (project_id, instructions, description) VALUES (
    1,
    'Please read the following text',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
);
INSERT INTO prompt (project_id, instructions, description) VALUES (
    1,
    'Please read the following text',
    'Ut placerat finibus purus id dictum'
);
INSERT INTO prompt (project_id, instructions, description) VALUES (
    1,
    'Please read the following text',
    'Etiam malesuada consectetur elementum'
);

-- Session test data
INSERT INTO session (profile_id, project_id) VALUES (1, 1);
INSERT INTO session (profile_id, project_id) VALUES (2, 1);

-- Recording test data
INSERT INTO recording (session_id, prompt_id, duration_in_seconds, file_size) VALUES (1, 1, 5.762, 277895);
INSERT INTO recording (session_id, prompt_id, duration_in_seconds, file_size) VALUES (1, 3, 2.421, 103948);
INSERT INTO recording (session_id, prompt_id, duration_in_seconds, file_size) VALUES (2, 1, 7.559, 397852);

-- Grant permissions for newly created tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO speech_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO speech_app;
