-- profiles 테이블에 is_admin 컬럼 추가 (Admin 관리자 구분)
-- Admin 대시보드에서 모든 프로필/사용자 조회 가능하도록 RLS 정책 수정

-- 1. is_admin 컬럼 추가
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. 인덱스 추가 (admin 필터링 쿼리 최적화)
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- 3. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 조회할 수 있음" ON profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 수정할 수 있음" ON profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 삭제할 수 있음" ON profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 생성할 수 있음" ON profiles;

-- 4. 새로운 SELECT 정책: 자신의 프로필 또는 Admin만 조회 가능
CREATE POLICY "프로필 조회: 본인 또는 Admin"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id        -- 본인 프로필 조회
    OR
    (                      -- Admin이면 모든 프로필 조회 가능
      SELECT is_admin FROM profiles WHERE id = auth.uid()
    ) = TRUE
  );

-- 5. UPDATE 정책: 본인만 수정 가능 (Admin도 본인 프로필만 수정)
CREATE POLICY "프로필 수정: 본인만 가능"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. DELETE 정책: 본인만 삭제 가능 (Admin도 본인만 삭제)
CREATE POLICY "프로필 삭제: 본인만 가능"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 7. INSERT 정책: auth 트리거가 생성하므로 필요 없음
-- (SECURITY DEFINER로 작동하므로 RLS 정책 무시)
CREATE POLICY "프로필 생성: auth 시스템"
  ON profiles FOR INSERT
  WITH CHECK (TRUE);

-- 참고: ADMIN_EMAILS에 포함된 사용자는 Supabase 콘솔에서 수동으로
-- 해당 프로필의 is_admin 컬럼을 TRUE로 설정해야 함
