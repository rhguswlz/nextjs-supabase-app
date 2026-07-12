-- 이벤트(모임) 테이블 생성
-- 날짜 조율 앱의 핵심 테이블: 이벤트 정보 및 후보 날짜 관리

CREATE TABLE events (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 주최자 정보 (auth.users 참조)
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 이벤트 상세 정보
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- 날짜 관련 필드
  candidate_dates DATE[],            -- 후보 날짜 배열
  deadline DATE,                     -- 응답 마감일
  confirmed_date DATE,               -- 확정된 날짜 (nullable)

  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'confirmed')),

  -- 초대 토큰 (고유 링크 생성용)
  invite_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 인덱스 생성 (쿼리 성능 최적화)
CREATE UNIQUE INDEX idx_events_invite_token ON events(invite_token);
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_status ON events(status);

-- Row Level Security (RLS) 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 주최자이거나 유효한 초대 토큰을 통한 게스트 접근 허용
-- (게스트 접근은 participants 테이블의 guest_token으로 별도 검증)
CREATE POLICY "이벤트 조회: 주최자 또는 참여자"
  ON events FOR SELECT
  USING (
    -- 주최자는 자신의 이벤트 조회 가능
    auth.uid() = host_id
    OR
    -- 인증된 사용자는 참여자로 등록된 이벤트 조회 가능
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.event_id = events.id
        AND participants.user_id = auth.uid()
    )
    OR
    -- 비인증 사용자도 초대 토큰이 있으면 조회 가능 (RLS는 토큰 검증 없이 허용, 앱 레벨에서 검증)
    TRUE
  );

-- UPDATE 정책: 주최자만 수정 가능
CREATE POLICY "이벤트 수정: 주최자만 가능"
  ON events FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- DELETE 정책: 주최자만 삭제 가능
CREATE POLICY "이벤트 삭제: 주최자만 가능"
  ON events FOR DELETE
  USING (auth.uid() = host_id);

-- INSERT 정책: 인증된 사용자만 이벤트 생성 가능 (자신이 주최자)
CREATE POLICY "이벤트 생성: 인증된 사용자"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
