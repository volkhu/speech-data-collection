UPDATE project
SET name = ${name}, description = ${description},
randomize_prompt_order = ${randomize_prompt_order},
allow_repeated_sessions = ${allow_repeated_sessions},
active = ${active}, last_edited_by = ${last_edited_by},
last_edited_at = NOW()
WHERE project_id = ${project_id}
RETURNING project_id;
