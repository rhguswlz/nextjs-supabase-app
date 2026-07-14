-- Admin RLS 정책 단순화 (순환 참조 제거)
DROP POLICY IF EXISTS "프로필 조회: 본인 또는 Admin" ON profiles;

-- 새로운 SELECT 정책: 본인만 또는 is_admin=true인 사용자는 모든 프로필 조회 가능
CREATE POLICY "프로필 조회: 본인 또는 Admin이 모두 조회"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE))
  );
