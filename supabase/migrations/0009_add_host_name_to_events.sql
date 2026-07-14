-- events 테이블에 host_name 컬럼 추가
-- 주최자의 이름을 저장하여 RLS 정책 충돌 없이 참여자 생성 시 사용

ALTER TABLE events ADD COLUMN host_name TEXT DEFAULT '주최자';

-- 기존 events에 대해 profiles에서 host_name 조회 및 업데이트
UPDATE events e
SET host_name = COALESCE(p.full_name, p.email, '주최자')
FROM profiles p
WHERE e.host_id = p.id AND e.host_name = '주최자';
