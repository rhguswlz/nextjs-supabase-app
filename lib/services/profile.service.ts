/**
 * @deprecated 이 파일은 지원 중단(deprecated)되었습니다.
 *
 * 마이그레이션 가이드:
 * - Server Components, Server Actions에서는 @/lib/services/server/profile.service를 사용하세요.
 * - Client Components에서는 @/lib/services/client/profile.service를 사용하세요.
 *
 * 이 파일의 문제점:
 * 1. 전역 supabase 클라이언트를 사용해 Fluid Compute와 호환되지 않습니다.
 * 2. 서버/클라이언트 컨텍스트를 구분하지 않아 혼용 위험이 있습니다.
 * 3. 일부 함수에서 에러 처리가 일관되지 않습니다 (null 반환 vs throw).
 *
 * 이 파일은 하위 호환성을 위해 일시적으로 유지됩니다.
 * 향후 버전에서 제거될 예정입니다.
 */

import { createClient } from "@/lib/supabase/client";
import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "@/lib/database.types";

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * @deprecated @/lib/services/server/profile.service의 getProfile()을 사용하세요
 */
export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("프로필 조회 오류:", error);
    return null;
  }

  return data as Profile;
}

/**
 * @deprecated @/lib/services/server/profile.service의 createProfile()을 사용하세요
 */
export async function createProfile(profile: ProfileInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error("프로필 생성 오류:", error);
    throw error;
  }

  return data as Profile;
}

/**
 * @deprecated @/lib/services/server/profile.service의 updateProfile()을 사용하세요
 */
export async function updateProfile(userId: string, profile: ProfileUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("프로필 업데이트 오류:", error);
    throw error;
  }

  return data as Profile;
}

/**
 * @deprecated @/lib/services/server/profile.service의 deleteProfile()을 사용하세요
 */
export async function deleteProfile(userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    console.error("프로필 삭제 오류:", error);
    throw error;
  }
}

/**
 * @deprecated @/lib/services/server/profile.service의 getProfileByEmail()을 사용하세요
 */
export async function getProfileByEmail(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("이메일로 프로필 조회 오류:", error);
  }

  return data as Profile | null;
}

/**
 * @deprecated @/lib/services/server/profile.service의 getAllProfiles()을 사용하세요
 */
export async function getAllProfiles(limit: number = 10, offset: number = 0) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("프로필 목록 조회 오류:", error);
    return { data: [], count: 0 };
  }

  return { data: data as Profile[], count: count || 0 };
}
