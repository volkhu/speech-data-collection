SELECT prompt_id, description, instructions, image, created_at, creator.email AS created_by,
last_edited_at, editor.email AS last_edited_by
FROM prompt
INNER JOIN account AS creator ON created_by = creator.account_id
INNER JOIN account AS editor ON last_edited_by = editor.account_id
WHERE project_id = ${project_id} AND deleted = FALSE
ORDER BY prompt_id ASC;
