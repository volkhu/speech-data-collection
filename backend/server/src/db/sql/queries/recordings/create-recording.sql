INSERT INTO recording
(session_id, prompt_id, duration_in_seconds)
VALUES (
    ${session_id},
    ${prompt_id},
    ${duration_in_seconds}
)
RETURNING recording_id;
