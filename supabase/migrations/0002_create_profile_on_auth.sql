-- Auth 사용자 생성 시 자동으로 프로필 생성
-- Supabase Auth 사용자가 생성될 때 profiles 테이블에 프로필 레코드 자동 생성

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 대한 트리거 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
