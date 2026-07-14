-- 테스트 사용자(testuser@example.com)를 Admin으로 설정
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'testuser@example.com' AND is_admin = FALSE;
