SELECT project_id, name, description
FROM project
WHERE active = TRUE AND project_id = ${project_id};
