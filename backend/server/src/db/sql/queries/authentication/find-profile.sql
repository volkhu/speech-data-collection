SELECT device_id, profile_id, created_at, year_of_birth, gender, native_language, dialect
FROM profile
WHERE device_id = ${device_id};
