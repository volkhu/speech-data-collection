SELECT account_id, google_id, email, has_admin_access, is_superuser
FROM account
WHERE google_id = ${google_id}
