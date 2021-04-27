UPDATE prompt
SET deleted = TRUE
WHERE prompt_id = ${prompt_id}
RETURNING prompt_id, project_id;
