SELECT project_id, name, description,
(SELECT COUNT(session_id) FROM session WHERE session.project_id = project_id AND session.profile_id = ${profile_id} AND session.completed = FALSE) AS sessions_in_progress,
(SELECT COUNT(session_id) FROM session WHERE session.project_id = project_id AND session.profile_id = ${profile_id} AND session.completed = TRUE) AS sessions_completed
FROM project
WHERE active = TRUE
ORDER BY name ASC;
