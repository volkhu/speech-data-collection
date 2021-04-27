UPDATE project
SET last_edited_at = NOW(), last_edited_by = ${last_edited_by}
WHERE project_id = ${project_id};
