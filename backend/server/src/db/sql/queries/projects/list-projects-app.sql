SELECT project_id, name, description, allow_repeated_sessions,
(
    SELECT COUNT(*)
    FROM prompt
    WHERE prompt.deleted = FALSE
    AND prompt.project_id = project.project_id
) AS num_prompts,
(
    SELECT COUNT(*)
    FROM session
    INNER JOIN recording USING (session_id)
    INNER JOIN prompt USING (prompt_id)
    WHERE session.project_id = project.project_id
    AND session.profile_id = ${profile_id}
    AND session.completed = FALSE
    AND prompt.deleted = FALSE
) AS num_recordings_in_active_session,
(
    SELECT COUNT(*)
    FROM session
    WHERE session.project_id = project.project_id
    AND session.profile_id = ${profile_id}
    AND session.completed = FALSE
) AS num_active_sessions,
(
    SELECT COUNT(*)
    FROM session
    WHERE session.project_id = project.project_id
    AND session.profile_id = ${profile_id}
    AND session.completed = TRUE
) AS num_sessions_completed
FROM project
WHERE active = TRUE
ORDER BY name ASC;
