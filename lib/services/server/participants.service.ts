/**
 * 서버 사이드 참여자 서비스
 *
 * 참여자 데이터 CRUD 관련 비즈니스 로직을 담당합니다.
 * 게스트 참여 등록, 조회, 재편집 기능을 제공합니다.
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 * - 에러 발생 시 null 반환 대신 throw를 사용합니다.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/database.types";

/** 참여자 행 타입 */
export type Participant = Tables<"participants">;
/** 참여자 삽입 타입 */
export type ParticipantInsert = TablesInsert<"participants">;

/**
 * 새 게스트 참여자를 생성합니다.
 *
 * @param eventId - 이벤트 ID
 * @param guestName - 게스트 이름
 * @param guestToken - 게스트 고유 토큰 (선택사항, 없으면 자동 생성)
 * @returns 생성된 참여자 데이터
 * @throws 참여자 생성 실패 시 Error
 */
export async function createParticipant(
  eventId: string,
  guestName: string,
  guestToken?: string,
): Promise<Participant> {
  const supabase = await createClient();

  const token =
    guestToken ||
    `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: eventId,
      guest_name: guestName,
      guest_token: token,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // UNIQUE 제약 위반
      throw new Error(`이미 ${guestName}님이 이 이벤트에 참여하고 있습니다.`);
    }
    throw new Error(`참여자 생성에 실패했습니다: ${error.message}`);
  }

  return data;
}

/**
 * 이벤트의 모든 참여자를 조회합니다.
 *
 * @param eventId - 조회할 이벤트의 UUID
 * @returns 참여자 배열
 * @throws 참여자 조회 실패 시 Error
 */
export async function getParticipantsByEventId(
  eventId: string,
): Promise<Participant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`참여자 조회에 실패했습니다: ${error.message}`);
  }

  return data || [];
}

/**
 * 게스트 토큰으로 참여자를 조회합니다.
 * 게스트 재편집(F006) 구현에 필수적입니다.
 *
 * @param eventId - 이벤트 ID
 * @param guestToken - 게스트 토큰
 * @returns 참여자 데이터, 없으면 null
 * @throws 참여자 조회 실패 시 Error
 */
export async function getParticipantByToken(
  eventId: string,
  guestToken: string,
): Promise<Participant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .eq("guest_token", guestToken)
    .maybeSingle();

  if (error) {
    throw new Error(`참여자 조회에 실패했습니다: ${error.message}`);
  }

  return data || null;
}

/**
 * 참여자를 삭제합니다.
 *
 * @param participantId - 삭제할 참여자의 UUID
 * @throws 참여자 삭제 실패 시 Error
 */
export async function deleteParticipant(participantId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    throw new Error(`참여자 삭제에 실패했습니다: ${error.message}`);
  }
}
