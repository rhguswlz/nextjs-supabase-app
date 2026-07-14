-- admin@example.com을 Admin으로 설정
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'admin@example.com' AND is_admin = FALSE;
