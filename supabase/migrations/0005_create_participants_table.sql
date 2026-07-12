-- 참여자 테이블 생성
-- 이벤트에 참여하는 게스트 관리 테이블
-- 비인증 사용자(guest_token)와 인증 사용자(user_id) 모두 지원

CREATE TABLE participants (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 이벤트 참조 (이벤트 삭제 시 참여자도 함께 삭제)
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- 게스트 정보
  guest_name TEXT NOT NULL,           -- 표시 이름 (필수)
  guest_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,  -- 비인증 게스트 식별 토큰

  -- 인증 사용자 연결 (선택적 - 비인증 게스트는 NULL)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- 동일 이벤트에 같은 이름의 참여자 중복 방지
  CONSTRAINT unique_participant_per_event UNIQUE (event_id, guest_name)
);

-- 인덱스 생성 (쿼리 성능 최적화)
CREATE UNIQUE INDEX idx_participants_guest_token ON participants(guest_token);
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_participants_user_id ON participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_participants_created_at ON participants(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 이벤트 주최자, 본인, 또는 같은 이벤트 참여자 조회 가능
CREATE POLICY "참여자 조회: 이벤트 주최자 또는 참여자"
  ON participants FOR SELECT
  USING (
    -- 이벤트 주최자는 모든 참여자 조회 가능
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
    OR
    -- 인증된 사용자는 자신의 참여 정보 조회 가능
    user_id = auth.uid()
    OR
    -- 비인증 사용자도 참여자 목록 조회 가능 (가용성 집계용)
    TRUE
  );

-- INSERT 정책: 누구나 참여자로 등록 가능 (초대 링크를 통한 접근 가정)
CREATE POLICY "참여자 등록: 누구나 가능"
  ON participants FOR INSERT
  WITH CHECK (TRUE);

-- UPDATE 정책: 이벤트 주최자 또는 본인만 수정 가능
CREATE POLICY "참여자 수정: 주최자 또는 본인"
  ON participants FOR UPDATE
  USING (
    -- 이벤트 주최자는 참여자 정보 수정 가능
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
    OR
    -- 인증된 사용자는 자신의 정보만 수정 가능
    user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

-- DELETE 정책: 이벤트 주최자 또는 본인만 삭제 가능
CREATE POLICY "참여자 삭제: 주최자 또는 본인"
  ON participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participants_updated_at();
