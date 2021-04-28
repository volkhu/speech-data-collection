SELECT session_id, profile_id, project_id, completed, created_at
FROM session
WHERE session_id = ${session_id};
