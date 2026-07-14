"use server";

import {
  createParticipant,
  getParticipantByToken,
} from "@/lib/services/server/participants.service";
import {
  addAvailability,
  deleteAvailabilityByParticipantId,
} from "@/lib/services/server/availability.service";

/**
 * 게스트 참여자를 생성하고 가용 날짜를 등록합니다.
 *
 * @param eventId - 이벤트 ID
 * @param guestName - 게스트 이름
 * @param dates - 선택한 날짜 배열
 * @param guestToken - 게스트 토큰 (재편집용)
 * @returns 생성된 참여자의 게스트 토큰
 */
export async function createGuestParticipant(
  eventId: string,
  guestName: string,
  dates: string[],
  guestToken?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // 기존 참여자 확인 (재편집)
    let participant;
    if (guestToken) {
      participant = await getParticipantByToken(eventId, guestToken);
      if (participant) {
        // 기존 가용성 삭제 후 새로 추가
        await deleteAvailabilityByParticipantId(participant.id);
      } else {
        // 토큰이 유효하지 않으면 새로 생성
        participant = await createParticipant(eventId, guestName, guestToken);
      }
    } else {
      // 신규 참여자 생성
      participant = await createParticipant(eventId, guestName);
    }

    // 가용 날짜 추가
    await addAvailability(participant.id, eventId, dates);

    return {
      success: true,
      token: participant.guest_token,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "참여 등록에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}
