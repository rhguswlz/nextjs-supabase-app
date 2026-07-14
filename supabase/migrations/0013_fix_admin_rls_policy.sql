-- Admin RLS 정책 수정 (순환 참조 제거)
-- 기존 정책 삭제
DROP POLICY IF EXISTS "프로필 조회: 본인 또는 Admin" ON profiles;

-- 새로운 SELECT 정책: 자신의 프로필만 조회 (Admin도 자신의 프로필만 조회)
-- Admin 권한 확인은 애플리케이션 레벨에서 처리
CREATE POLICY "프로필 조회: 본인만 가능"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
