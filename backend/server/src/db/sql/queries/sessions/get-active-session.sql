SELECT session_id
FROM session
WHERE profile_id = ${profile_id} AND project_id = ${project_id} AND completed = FALSE;
