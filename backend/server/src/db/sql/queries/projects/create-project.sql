INSERT INTO project
(name, description, randomize_prompt_order, allow_repeated_sessions, active, created_by, last_edited_by)
VALUES (
    ${name},
    ${description},
    ${randomize_prompt_order},
    ${allow_repeated_sessions},
    ${active},
    ${created_by},
    ${last_edited_by}
)
RETURNING project_id;
