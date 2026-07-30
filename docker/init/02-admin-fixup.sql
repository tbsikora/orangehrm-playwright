UPDATE ohrm_user SET user_name = 'admin', user_password = '$2y$12$Qr49e3Vgyl49ez063MgFD.vAPFgq.ACd4eMH/NE3KC4DBUHXQu0DS' WHERE id = 1;
UPDATE hs_hr_config SET value = 'off' WHERE name = 'auth.password_policy.enforce_password_strength';
