"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createParticipant,
  getParticipantByToken,
} from "@/lib/services/server/participants.service";
import {
  addAvailability,
  deleteAvailabilityByParticipantId,
} from "@/lib/services/server/availability.service";
import {
  getEventById,
  confirmEventDate as confirmEventDateService,
} from "@/lib/services/server/events.service";

/**
 * 새 이벤트를 생성합니다.
 *
 * @param title - 이벤트 제목
 * @param description - 이벤트 설명
 * @param location - 이벤트 장소
 * @param candidateDates - 후보 날짜 배열
 * @param deadline - 응답 마감일
 * @returns 생성된 이벤트 ID
 */
export async function createEvent(
  title: string,
  description: string | undefined,
  location: string | undefined,
  candidateDates: string[],
  deadline: string,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "인증이 필요합니다." };
    }

    // 주최자 정보: auth 메타데이터 → profiles → email → 기본값 순서
    const authFullName =
      (userData.user?.user_metadata?.full_name as string) || null;

    let hostName = authFullName;

    // auth 메타데이터에 없으면 profiles 조회 시도
    if (!hostName) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userData.user.id)
          .single();
        hostName = profileData?.full_name ?? profileData?.email ?? null;
      } catch {
        // 프로필 조회 실패 무시
      }
    }

    // 마지막 fallback
    if (!hostName) {
      hostName = userData.user.email || "주최자";
    }

    console.log("[createEvent] 주최자 정보:", {
      userId: userData.user.id,
      email: userData.user.email,
      authFullName: authFullName,
      finalHostName: hostName,
    });

    // 이벤트 생성 시 host_name도 함께 저장
    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        description: description || null,
        location: location || null,
        candidate_dates: candidateDates,
        deadline,
        host_id: userData.user.id,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: `이벤트 생성 실패: ${error.message}` };
    }

    // 주최자를 참여자로 추가 (투표 가능하게 함)
    try {
      await supabase
        .from("participants")
        .upsert({
          event_id: data.id,
          guest_name: hostName,
          user_id: userData.user.id,
        })
        .select()
        .single();
    } catch (error) {
      // 주최자 추가 실패는 이벤트 생성 자체는 성공한 것이므로 무시
      console.error("주최자 참여자 추가 실패:", error);
    }

    return {
      success: true,
      eventId: data.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "이벤트 생성에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

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

/**
 * 주최자의 가용 날짜를 저장합니다.
 *
 * @param eventId - 이벤트 ID
 * @param dates - 선택한 날짜 배열
 * @returns 성공 여부
 */
export async function updateHostAvailability(
  eventId: string,
  dates: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "인증이 필요합니다." };
    }

    // 주최자 참여자 조회 (user_id로 식별)
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userData.user.id)
      .single();

    if (participantError || !participant) {
      return {
        success: false,
        error: "주최자 정보를 찾을 수 없습니다.",
      };
    }

    // 기존 가용성 삭제
    await deleteAvailabilityByParticipantId(participant.id);

    // 새로운 가용성 추가
    await addAvailability(participant.id, eventId, dates);

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "가용성 저장에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 주최자가 이벤트의 날짜를 확정합니다.
 *
 * @param eventId - 이벤트 ID
 * @param confirmedDate - 확정할 날짜 (YYYY-MM-DD 형식)
 * @returns 성공 여부
 */
export async function confirmEventDate(
  eventId: string,
  confirmedDate: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "인증이 필요합니다." };
    }

    // 이벤트 조회
    const event = await getEventById(eventId);

    // 주최자 권한 검증
    if (event.host_id !== userData.user.id) {
      return { success: false, error: "주최자만 날짜를 확정할 수 있습니다." };
    }

    // 날짜 확정
    await confirmEventDateService(eventId, confirmedDate);

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "날짜 확정에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}
