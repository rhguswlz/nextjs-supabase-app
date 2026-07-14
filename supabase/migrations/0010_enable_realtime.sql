-- Realtime 구독 활성화 마이그레이션
-- availability_dates와 participants 테이블을 Supabase Realtime publication에 추가합니다.
--
-- Supabase Realtime은 PostgreSQL의 logical replication을 기반으로 합니다.
-- supabase_realtime publication에 테이블을 추가해야 변경사항이 실시간으로 전송됩니다.
--
-- 주의사항:
-- - IF NOT EXISTS 구문이 ALTER PUBLICATION에 지원되지 않으므로
--   DO $$ 블록을 사용하여 중복 추가를 방지합니다.
-- - RLS SELECT 정책은 이미 USING (TRUE)로 설정되어 있어 별도 변경 불필요합니다.

-- availability_dates 테이블 Realtime 활성화
DO $$
BEGIN
  -- 이미 publication에 추가되었는지 확인
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'availability_dates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE availability_dates;
    RAISE NOTICE 'availability_dates 테이블을 Realtime publication에 추가했습니다.';
  ELSE
    RAISE NOTICE 'availability_dates 테이블은 이미 Realtime publication에 있습니다.';
  END IF;
END $$;

-- participants 테이블 Realtime 활성화
DO $$
BEGIN
  -- 이미 publication에 추가되었는지 확인
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE participants;
    RAISE NOTICE 'participants 테이블을 Realtime publication에 추가했습니다.';
  ELSE
    RAISE NOTICE 'participants 테이블은 이미 Realtime publication에 있습니다.';
  END IF;
END $$;

-- Realtime 활성화 검증 쿼리 (마이그레이션 후 확인용)
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
