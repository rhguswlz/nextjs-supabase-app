-- Admin 사용자 설정 (ADMIN_EMAILS 기반)
-- 환경변수에 정의된 관리자 이메일의 is_admin을 자동으로 TRUE로 설정

-- hjkoh0907@gmail.com Admin 설정
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'hjkoh0907@gmail.com' AND is_admin = FALSE;
