INSERT INTO session
(profile_id, project_id, completed)
VALUES (
    ${profile_id},
    ${project_id},
    FALSE
)
RETURNING session_id;
