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
