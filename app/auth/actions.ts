'use server'

import { createClient } from '@/lib/supabase/server'

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  // Supabase Auth에 사용자 등록
  // 프로필은 trigger가 자동으로 생성합니다
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/protected`,
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('사용자 생성 실패')
  }

  return { success: true, user: authData.user }
}
