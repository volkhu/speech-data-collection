UPDATE settings
SET mobile_app_terms = ${mobile_app_terms}
RETURNING mobile_app_terms;
