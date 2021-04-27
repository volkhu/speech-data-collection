SELECT prompt_id, project_id, instructions, description, image
FROM prompt
WHERE prompt_id = ${prompt_id} AND deleted = FALSE;
