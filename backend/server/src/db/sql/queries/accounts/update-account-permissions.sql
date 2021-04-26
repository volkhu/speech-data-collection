UPDATE account
SET has_admin_access = ${has_admin_access}, is_superuser = ${is_superuser}
WHERE account_id = ${account_id} RETURNING account_id;
