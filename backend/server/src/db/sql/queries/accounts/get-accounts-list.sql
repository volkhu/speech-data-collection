SELECT account_id, email, has_admin_access, is_superuser
FROM account
ORDER BY is_superuser DESC, has_admin_access DESC, email ASC;
