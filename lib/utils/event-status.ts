/**
 * 이벤트 상태 관련 유틸리티 함수
 */

import type { Tables } from "@/lib/database.types";

export type Event = Tables<"events">;

/**
 * 이벤트의 마감일 여부를 확인합니다.
 * deadline이 현재 시간보다 이전이면 마감된 것으로 간주합니다.
 *
 * @param event - 이벤트 데이터
 * @returns 마감되었으면 true, 아니면 false
 */
export function isEventClosed(event: Event): boolean {
  if (!event.deadline) {
    return false;
  }

  const now = new Date();
  const deadline = new Date(event.deadline);

  // deadline이 DATE 타입이므로 자정(00:00:00)으로 취급
  // 마감일 당일 23:59:59까지 응답 가능하도록 처리
  deadline.setHours(23, 59, 59, 999);

  return now > deadline;
}
