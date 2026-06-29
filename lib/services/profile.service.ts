import { createClient } from '@/lib/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

const supabase = createClient()

// 프로필 조회 (사용자 ID로)
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('프로필 조회 오류:', error)
    return null
  }

  return data as Profile
}

// 프로필 생성
export async function createProfile(profile: ProfileInsert) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('프로필 생성 오류:', error)
    throw error
  }

  return data as Profile
}

// 프로필 업데이트
export async function updateProfile(userId: string, profile: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('프로필 업데이트 오류:', error)
    throw error
  }

  return data as Profile
}

// 프로필 삭제
export async function deleteProfile(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('프로필 삭제 오류:', error)
    throw error
  }
}

// 이메일로 프로필 조회
export async function getProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('이메일로 프로필 조회 오류:', error)
  }

  return data as Profile | null
}

// 모든 프로필 조회 (관리자용)
export async function getAllProfiles(limit: number = 10, offset: number = 0) {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('프로필 목록 조회 오류:', error)
    return { data: [], count: 0 }
  }

  return { data: data as Profile[], count: count || 0 }
}
