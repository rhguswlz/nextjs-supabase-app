/**
 * 서버 사이드 이벤트 서비스
 *
 * 이벤트 데이터 조회 관련 비즈니스 로직을 담당합니다.
 * Server Components, Server Actions, Route Handlers에서 사용합니다.
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 * - 에러 발생 시 null 반환 대신 throw를 사용합니다.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

/** 이벤트 행 타입 */
export type Event = Tables<"events">;

/**
 * 초대 토큰으로 이벤트를 조회합니다.
 * 게스트가 초대 링크를 통해 접근할 때 사용됩니다.
 *
 * @param inviteToken - 초대 토큰
 * @returns 이벤트 데이터
 * @throws 이벤트 조회 실패 시 Error
 */
export async function getEventByToken(inviteToken: string): Promise<Event> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("invite_token", inviteToken)
    .single();

  if (error) {
    throw new Error(`이벤트 조회에 실패했습니다: ${error.message}`);
  }

  return data;
}

/**
 * 이벤트 ID로 이벤트를 조회합니다.
 *
 * @param eventId - 조회할 이벤트의 UUID
 * @returns 이벤트 데이터
 * @throws 이벤트 조회 실패 시 Error
 */
export async function getEventById(eventId: string): Promise<Event> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    throw new Error(`이벤트 조회에 실패했습니다: ${error.message}`);
  }

  return data;
}

/**
 * 사용자가 주최한 모든 이벤트를 조회합니다.
 *
 * @param userId - 조회할 주최자의 UUID
 * @returns 이벤트 배열
 * @throws 이벤트 조회 실패 시 Error
 */
export async function getUserEvents(userId: string): Promise<Event[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`이벤트 조회에 실패했습니다: ${error.message}`);
  }

  return data || [];
}

/**
 * 주최자가 이벤트의 날짜를 확정합니다.
 * confirmed_date를 설정하고 상태를 'confirmed'으로 변경합니다.
 *
 * @param eventId - 이벤트 ID
 * @param confirmedDate - 확정할 날짜 (YYYY-MM-DD 형식)
 * @returns 업데이트된 이벤트 데이터
 * @throws 업데이트 실패 시 Error
 */
export async function confirmEventDate(
  eventId: string,
  confirmedDate: string,
): Promise<Event> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      confirmed_date: confirmedDate,
      status: "confirmed",
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`날짜 확정에 실패했습니다: ${error.message}`);
  }

  return data;
}
