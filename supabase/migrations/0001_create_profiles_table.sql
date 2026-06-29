-- 프로필 테이블 생성
-- Supabase Auth와 연동되는 사용자 프로필 관리 테이블

CREATE TABLE profiles (
  -- 기본 정보
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 사용자 정보
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 인덱스 생성 (쿼리 성능 최적화)
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Row Level Security (RLS) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "사용자는 자신의 프로필을 조회할 수 있음"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있음"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 프로필만 삭제 가능
CREATE POLICY "사용자는 자신의 프로필을 삭제할 수 있음"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 인증된 사용자는 프로필 생성 가능 (자신의 프로필만)
CREATE POLICY "사용자는 자신의 프로필을 생성할 수 있음"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
