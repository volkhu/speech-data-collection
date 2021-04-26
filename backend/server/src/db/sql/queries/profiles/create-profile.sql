INSERT INTO profile
(device_id, year_of_birth, gender, native_language, dialect)
VALUES (${device_id}, ${year_of_birth}, ${gender}, ${native_language}, ${dialect})
ON CONFLICT DO NOTHING
RETURNING profile_id;
