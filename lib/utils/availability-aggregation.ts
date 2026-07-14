/**
 * 클라이언트 사이드 가용성 집계 유틸리티
 *
 * 서버의 `getAvailabilityByEventId` 로직을 클라이언트에서도 사용할 수 있도록
 * Supabase 의존성 없이 순수 함수로 추출한 집계 유틸입니다.
 *
 * Realtime 구독으로 받은 원시 데이터를 즉시 재계산하는 데 사용됩니다.
 */

import type { Tables } from "@/lib/database.types";

/** 가용성 날짜 행 타입 (database.types에서 추출) */
export type AvailabilityDateRow = Pick<
  Tables<"availability_dates">,
  "date" | "participant_id"
>;

/** 참여자 행 타입 (database.types에서 추출) */
export type ParticipantRow = Pick<Tables<"participants">, "id" | "guest_name">;

/** 날짜별 집계 결과 타입 */
export interface AggregatedAvailability {
  date: string;
  count: number;
  participants: string[]; // 참여자 이름 목록
}

/**
 * 가용성 날짜 행 배열과 참여자 배열을 받아 날짜별로 집계합니다.
 *
 * 서버의 `getAvailabilityByEventId`와 동일한 집계 로직을 순수 함수로 구현합니다.
 * Supabase 클라이언트 없이 클라이언트 컴포넌트에서 직접 호출할 수 있습니다.
 *
 * @param availabilityRows - availability_dates 테이블에서 조회한 행 배열
 * @param participants - participants 테이블에서 조회한 참여자 배열
 * @returns 날짜 오름차순으로 정렬된 집계 결과 배열
 *
 * @example
 * const aggregated = aggregateAvailability(availRows, participantRows);
 * // [{ date: "2025-08-01", count: 3, participants: ["홍길동", "김철수", "이영희"] }, ...]
 */
export function aggregateAvailability(
  availabilityRows: AvailabilityDateRow[],
  participants: ParticipantRow[],
): AggregatedAvailability[] {
  // 참여자 ID -> 이름 매핑 테이블 생성 (O(1) 조회 최적화)
  const participantMap = new Map<string, string>(
    participants.map((p) => [p.id, p.guest_name]),
  );

  // 날짜 -> 참여자 이름 목록 집계
  const dateMap = new Map<string, string[]>();

  for (const avail of availabilityRows) {
    const participantName = participantMap.get(avail.participant_id);

    // 참여자 이름이 없는 경우 집계에서 제외 (데이터 무결성 보호)
    if (!participantName) continue;

    const existing = dateMap.get(avail.date) ?? [];
    dateMap.set(avail.date, [...existing, participantName]);
  }

  // 날짜 오름차순으로 정렬하여 반환
  return Array.from(dateMap.entries())
    .map(([date, names]) => ({
      date,
      count: names.length,
      participants: names,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
