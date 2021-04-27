UPDATE prompt
SET description = ${description}, image = ${image},
instructions = ${instructions}, last_edited_at = NOW()
WHERE prompt_id = ${prompt_id} AND deleted = FALSE
RETURNING prompt_id;
