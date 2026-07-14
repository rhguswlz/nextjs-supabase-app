/**
 * 서버 사이드 가용성 서비스
 *
 * 게스트의 가용 날짜 관리 및 집계 관련 비즈니스 로직을 담당합니다.
 * 가용성 추가, 조회, 삭제 및 날짜별 집계 기능을 제공합니다.
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 * - 에러 발생 시 null 반환 대신 throw를 사용합니다.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";
import { getParticipantsByEventId } from "./participants.service";

/** 가용성 날짜 행 타입 */
export type AvailabilityDate = Tables<"availability_dates">;

/** 날짜별 집계 타입 */
export interface AggregatedAvailability {
  date: string;
  count: number;
  participants: string[];
}

/**
 * 참여자의 가용 날짜를 추가합니다.
 * 기존 날짜는 무시하고 새로운 날짜만 추가합니다 (upsert 패턴).
 *
 * @param participantId - 참여자 ID
 * @param eventId - 이벤트 ID
 * @param dates - 추가할 날짜 배열 (YYYY-MM-DD 형식)
 * @returns 추가된 가용성 데이터 배열
 * @throws 가용성 추가 실패 시 Error
 */
export async function addAvailability(
  participantId: string,
  eventId: string,
  dates: string[],
): Promise<AvailabilityDate[]> {
  const supabase = await createClient();

  // 기존 가용성 조회
  const { data: existing, error: fetchError } = await supabase
    .from("availability_dates")
    .select("date")
    .eq("participant_id", participantId);

  if (fetchError) {
    throw new Error(`기존 가용성 조회에 실패했습니다: ${fetchError.message}`);
  }

  const existingDates = new Set((existing || []).map((a) => a.date));
  const newDates = dates.filter((date) => !existingDates.has(date));

  if (newDates.length === 0) {
    // 기존 데이터가 있으면 그대로 반환, 없으면 빈 배열
    return (
      existing?.map((e) => ({
        id: "",
        participant_id: participantId,
        event_id: eventId,
        date: e.date,
        created_at: new Date().toISOString(),
      })) || []
    );
  }

  // 새로운 날짜만 추가
  const { data, error } = await supabase
    .from("availability_dates")
    .insert(
      newDates.map((date) => ({
        participant_id: participantId,
        event_id: eventId,
        date,
      })),
    )
    .select();

  if (error) {
    throw new Error(`가용성 추가에 실패했습니다: ${error.message}`);
  }

  return data || [];
}

/**
 * 이벤트의 모든 가용성을 날짜별로 집계합니다.
 *
 * @param eventId - 조회할 이벤트의 UUID
 * @returns 날짜별 집계 결과 (날짜, 가능 인원 수, 참여자명 목록)
 * @throws 가용성 조회 실패 시 Error
 */
export async function getAvailabilityByEventId(
  eventId: string,
): Promise<AggregatedAvailability[]> {
  const supabase = await createClient();

  // 모든 가용성 데이터 조회
  const { data: availabilities, error: availError } = await supabase
    .from("availability_dates")
    .select("date, participant_id")
    .eq("event_id", eventId)
    .order("date", { ascending: true });

  if (availError) {
    throw new Error(`가용성 조회에 실패했습니다: ${availError.message}`);
  }

  // 모든 참여자 정보 조회 (이름 매핑용)
  const participants = await getParticipantsByEventId(eventId);
  const participantMap = new Map(participants.map((p) => [p.id, p.guest_name]));

  // 날짜별로 집계
  const dateMap = new Map<string, string[]>();
  for (const avail of availabilities || []) {
    const participantName = participantMap.get(avail.participant_id);
    if (participantName) {
      const existing = dateMap.get(avail.date) || [];
      dateMap.set(avail.date, [...existing, participantName]);
    }
  }

  return Array.from(dateMap.entries())
    .map(([date, names]) => ({
      date,
      count: names.length,
      participants: names,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 참여자의 특정 날짜 가용성을 삭제합니다.
 *
 * @param participantId - 참여자 ID
 * @param date - 삭제할 날짜 (YYYY-MM-DD 형식)
 * @throws 가용성 삭제 실패 시 Error
 */
export async function deleteAvailability(
  participantId: string,
  date: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("availability_dates")
    .delete()
    .eq("participant_id", participantId)
    .eq("date", date);

  if (error) {
    throw new Error(`가용성 삭제에 실패했습니다: ${error.message}`);
  }
}

/**
 * 참여자의 모든 가용성을 삭제합니다.
 * 참여자 삭제 시 cascade 처리용입니다.
 *
 * @param participantId - 참여자 ID
 * @throws 가용성 삭제 실패 시 Error
 */
export async function deleteAvailabilityByParticipantId(
  participantId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("availability_dates")
    .delete()
    .eq("participant_id", participantId);

  if (error) {
    throw new Error(`가용성 삭제에 실패했습니다: ${error.message}`);
  }
}
