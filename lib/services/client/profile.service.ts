/**
 * 클라이언트 사이드 프로필 서비스
 *
 * 클라이언트 컴포넌트에서 프로필 데이터를 조회하고 수정하는 함수를 제공합니다.
 * 브라우저 클라이언트를 사용하므로 "use client" 디렉티브가 있는 컴포넌트 전용입니다.
 *
 * 주의사항:
 * - 이 서비스는 클라이언트 컴포넌트 전용입니다.
 * - Server Components에서는 @/lib/services/server/profile.service를 사용하세요.
 * - RLS(Row Level Security) 정책에 따라 접근 권한이 제한됩니다.
 */

import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/database.types";

/** 프로필 행 타입 */
export type Profile = Tables<"profiles">;
/** 프로필 업데이트 타입 */
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * 사용자 ID로 프로필을 조회합니다.
 *
 * @param userId - 조회할 사용자의 UUID
 * @returns 프로필 데이터
 * @throws 프로필 조회 실패 시 Error
 */
export async function getProfile(userId: string): Promise<Profile> {
  // 클라이언트 컴포넌트용 브라우저 클라이언트 사용
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`프로필 조회에 실패했습니다: ${error.message}`);
  }

  return data;
}

/**
 * 프로필을 업데이트합니다.
 *
 * @param userId - 업데이트할 사용자의 UUID
 * @param profile - 업데이트할 프로필 데이터 (부분 업데이트 가능)
 * @returns 업데이트된 프로필 데이터
 * @throws 프로필 업데이트 실패 시 Error
 */
export async function updateProfile(
  userId: string,
  profile: ProfileUpdate,
): Promise<Profile> {
  // 클라이언트 컴포넌트용 브라우저 클라이언트 사용
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`프로필 업데이트에 실패했습니다: ${error.message}`);
  }

  return data;
}
