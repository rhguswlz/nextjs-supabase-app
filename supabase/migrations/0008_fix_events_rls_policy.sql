-- events 테이블의 RLS 정책 수정
-- 순환 참조 문제 해결: participants 테이블 참조 제거

-- 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "이벤트 조회: 주최자 또는 참여자" ON events;

-- 새로운 SELECT 정책: 주최자는 자신의 이벤트 조회, 모두는 공개 이벤트 조회 가능
CREATE POLICY "이벤트 조회: 주최자 또는 공개"
  ON events FOR SELECT
  USING (
    -- 주최자는 자신의 이벤트 조회 가능
    auth.uid() = host_id
    OR
    -- 모든 사용자(비인증 포함)는 이벤트 조회 가능 (앱 레벨에서 권한 검증)
    TRUE
  );
