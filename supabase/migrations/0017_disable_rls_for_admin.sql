-- Admin RLS 순환 참조 문제 해결: RLS 정책 제거 후 애플리케이션 레벨 권한 검증으로 변경
DROP POLICY IF EXISTS "프로필 조회: 본인 또는 Admin이 모두 조회" ON profiles;
DROP POLICY IF EXISTS "프로필 조회: 본인만 가능" ON profiles;
DROP POLICY IF EXISTS "프로필 조회: 본인 또는 Admin" ON profiles;
DROP POLICY IF EXISTS "프로필 수정: 본인만 가능" ON profiles;
DROP POLICY IF EXISTS "프로필 삭제: 본인만 가능" ON profiles;
DROP POLICY IF EXISTS "프로필 생성: auth 시스템" ON profiles;

-- RLS 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
