INSERT INTO account (google_id, email, has_admin_access, is_superuser)
VALUES (${google_id}, ${email}, ${has_admin_access}, ${is_superuser})
RETURNING account_id, google_id, email, has_admin_access, is_superuser;
