SELECT *,
recording.created_at AS recording_created_at, session.created_at AS session_created_at
FROM recording
INNER JOIN session USING (session_id)
INNER JOIN prompt USING (prompt_id)
INNER JOIN profile USING (profile_id)
WHERE session.project_id = ${project_id};
