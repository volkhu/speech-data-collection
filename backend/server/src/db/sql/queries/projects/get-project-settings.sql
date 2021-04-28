SELECT project_id, randomize_prompt_order, allow_repeated_sessions, active
FROM project
WHERE project_id = ${project_id};
