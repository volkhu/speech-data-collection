SELECT *
FROM recording
INNER JOIN session USING (session_id)
WHERE session.project_id = ${project_id};
