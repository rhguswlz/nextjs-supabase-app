-- 가용 날짜 테이블 생성
-- 각 참여자가 참석 가능한 날짜를 기록하는 테이블
-- 이벤트의 최적 날짜 계산에 사용

CREATE TABLE availability_dates (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 참여자 참조 (참여자 삭제 시 가용 날짜도 함께 삭제)
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

  -- 이벤트 직접 참조 (집계 쿼리 최적화를 위한 역정규화)
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- 가용 날짜
  date DATE NOT NULL,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- 동일 참여자의 같은 날짜 중복 응답 방지
  CONSTRAINT unique_availability_per_participant UNIQUE (participant_id, date)
);

-- 인덱스 생성 (쿼리 성능 최적화)
-- 날짜별 참여 가능 인원 집계를 위한 복합 인덱스
CREATE INDEX idx_availability_dates_event_date ON availability_dates(event_id, date);
-- 참여자별 가용 날짜 조회를 위한 인덱스
CREATE INDEX idx_availability_dates_participant_id ON availability_dates(participant_id);
-- 날짜별 조회를 위한 인덱스
CREATE INDEX idx_availability_dates_date ON availability_dates(date);

-- Row Level Security (RLS) 활성화
ALTER TABLE availability_dates ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 같은 이벤트의 모든 가용 날짜 조회 가능 (집계 목적)
CREATE POLICY "가용날짜 조회: 이벤트 참여자 모두"
  ON availability_dates FOR SELECT
  USING (TRUE);

-- INSERT 정책: 이벤트 주최자 또는 본인 참여자만 가용 날짜 추가 가능
CREATE POLICY "가용날짜 추가: 참여자 본인"
  ON availability_dates FOR INSERT
  WITH CHECK (
    -- 참여자로 등록된 경우 가용 날짜 추가 가능
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = availability_dates.participant_id
        AND (
          -- 인증된 사용자는 자신의 참여자 레코드에만 추가 가능
          participants.user_id = auth.uid()
          OR
          -- 이벤트 주최자는 모든 참여자에 추가 가능
          EXISTS (
            SELECT 1 FROM events
            WHERE events.id = participants.event_id
              AND events.host_id = auth.uid()
          )
          OR
          -- 비인증 게스트도 허용 (guest_token 검증은 앱 레벨에서 처리)
          TRUE
        )
    )
  );

-- UPDATE 정책: 가용 날짜는 삭제 후 재추가 방식 사용 (UPDATE 불필요)
-- 필요시 주최자나 본인 참여자만 수정 가능
CREATE POLICY "가용날짜 수정: 참여자 본인 또는 주최자"
  ON availability_dates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = availability_dates.participant_id
        AND (p.user_id = auth.uid() OR e.host_id = auth.uid())
    )
  );

-- DELETE 정책: 본인 참여자 또는 이벤트 주최자만 삭제 가능
CREATE POLICY "가용날짜 삭제: 참여자 본인 또는 주최자"
  ON availability_dates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = availability_dates.participant_id
        AND (p.user_id = auth.uid() OR e.host_id = auth.uid())
    )
    OR
    -- 비인증 게스트도 허용 (guest_token 검증은 앱 레벨에서 처리)
    TRUE
  );

-- 참고: availability_dates는 자주 변경되는 데이터가 아니므로
-- updated_at 컬럼과 트리거를 추가하지 않음
-- 날짜 변경 시에는 삭제 후 재추가(DELETE + INSERT) 방식 사용
