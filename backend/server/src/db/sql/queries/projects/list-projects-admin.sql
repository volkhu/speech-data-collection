SELECT project_id, name, description, created_at, creator.email AS created_by,
last_edited_at, editor.email AS last_edited_by, active, randomize_prompt_order, allow_repeated_sessions,
(SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts,
(SELECT COUNT(*) FROM recording INNER JOIN session USING (session_id) WHERE session.project_id = project.project_id) AS num_recordings
FROM project
INNER JOIN account AS creator ON created_by = creator.account_id
INNER JOIN account AS editor ON last_edited_by = editor.account_id
ORDER BY active DESC, project_id ASC;
