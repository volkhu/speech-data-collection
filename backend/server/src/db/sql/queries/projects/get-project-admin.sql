SELECT project_id, name, description, created_at, creator.email AS created_by,
last_edited_at, editor.email AS last_edited_by, active, randomize_prompt_order, allow_repeated_sessions,
(SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts,
(SELECT COUNT(*) FROM session WHERE session.project_id = project.project_id) AS num_sessions,
(SELECT COUNT(DISTINCT session.profile_id) FROM session WHERE session.project_id = project.project_id) AS num_participants,
(SELECT COUNT(*) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS num_recordings,
(SELECT SUM(duration_in_seconds) FROM recording INNER JOIN session USING (session_id) WHERE session.project_id = project.project_id) AS total_recordings_duration
FROM project
INNER JOIN account AS creator ON created_by = creator.account_id
INNER JOIN account AS editor ON last_edited_by = editor.account_id
WHERE project_id = ${project_id};
