/**
 * 서버 사이드 프로필 서비스
 *
 * 프로필 데이터 조회 및 수정 관련 비즈니스 로직을 담당합니다.
 * Server Components, Server Actions, Route Handlers에서 사용합니다.
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 * - 에러 발생 시 null 반환 대신 throw를 사용합니다.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

/** 프로필 행 타입 */
export type Profile = Tables<"profiles">;
/** 프로필 삽입 타입 */
export type ProfileInsert = TablesInsert<"profiles">;
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
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

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
 * 새 프로필을 생성합니다.
 *
 * @param profile - 생성할 프로필 데이터
 * @returns 생성된 프로필 데이터
 * @throws 프로필 생성 실패 시 Error
 */
export async function createProfile(profile: ProfileInsert): Promise<Profile> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    throw new Error(`프로필 생성에 실패했습니다: ${error.message}`);
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
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

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

/**
 * 프로필을 삭제합니다.
 *
 * @param userId - 삭제할 사용자의 UUID
 * @throws 프로필 삭제 실패 시 Error
 */
export async function deleteProfile(userId: string): Promise<void> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    throw new Error(`프로필 삭제에 실패했습니다: ${error.message}`);
  }
}

/**
 * 이메일 주소로 프로필을 조회합니다.
 *
 * @param email - 조회할 이메일 주소
 * @returns 프로필 데이터 또는 null (해당 이메일의 프로필이 없는 경우)
 * @throws 데이터베이스 오류 발생 시 Error (데이터 없음 제외)
 */
export async function getProfileByEmail(
  email: string,
): Promise<Profile | null> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  // PGRST116: 데이터 없음 - 에러가 아닌 null 반환
  if (error && error.code !== "PGRST116") {
    throw new Error(`이메일로 프로필 조회에 실패했습니다: ${error.message}`);
  }

  return data ?? null;
}

/**
 * 모든 프로필을 페이지네이션으로 조회합니다. (관리자 전용)
 *
 * @param limit - 한 번에 가져올 최대 항목 수 (기본값: 10)
 * @param offset - 건너뛸 항목 수 (기본값: 0)
 * @returns 프로필 목록과 전체 개수
 * @throws 프로필 목록 조회 실패 시 Error
 */
export async function getAllProfiles(
  limit: number = 10,
  offset: number = 0,
): Promise<{ data: Profile[]; count: number }> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`프로필 목록 조회에 실패했습니다: ${error.message}`);
  }

  return { data: data ?? [], count: count ?? 0 };
}
