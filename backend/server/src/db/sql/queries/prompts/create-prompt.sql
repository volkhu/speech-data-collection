INSERT INTO prompt
(project_id, description, image, instructions, created_by, last_edited_by)
VALUES (
    ${project_id},
    ${description},
    ${image},
    ${instructions},
    ${created_by},
    ${last_edited_by}
)
RETURNING prompt_id, project_id;
