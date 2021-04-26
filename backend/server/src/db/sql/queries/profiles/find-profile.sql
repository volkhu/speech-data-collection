SELECT profile_id, year_of_birth, gender, native_language, dialect
FROM profile
WHERE device_id = ${device_id};
