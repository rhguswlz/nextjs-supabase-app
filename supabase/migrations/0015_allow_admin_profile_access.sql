-- Admin이 모든 프로필을 조회할 수 있도록 RLS 정책 수정
DROP POLICY IF EXISTS "프로필 조회: 본인만 가능" ON profiles;

-- 새로운 SELECT 정책: 본인 또는 Admin이 조회 가능
CREATE POLICY "프로필 조회: 본인 또는 Admin"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
