/**
 * 서버 사이드 Admin 서비스
 *
 * 관리자 전용 데이터 조회 및 통계 비즈니스 로직을 담당합니다.
 * Server Components에서만 사용합니다.
 *
 * 권한 검증:
 * - App 레벨: middleware + layout의 ADMIN_EMAILS 환경변수 체크
 * - DB 레벨: profiles.is_admin 필드 기반 RLS 정책 (추가 보호층)
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

/** 이벤트 행 타입 */
export type AdminEvent = Tables<"events"> & {
  /** 참여자 수 (집계) */
  participants_count: number;
  /** 주최자 프로필 이메일 */
  host_email: string | null;
  /** 주최자 이름 */
  host_name: string | null;
};

/** 사용자 프로필 + 통계 타입 */
export type AdminProfile = Tables<"profiles"> & {
  /** 생성한 이벤트 수 */
  created_events_count: number;
  /** 참여한 이벤트 수 */
  participated_events_count: number;
};

/** 전체 통계 타입 */
export interface AdminStats {
  /** 전체 이벤트 수 */
  totalEvents: number;
  /** 전체 사용자 수 */
  totalUsers: number;
  /** 확정된 이벤트 수 */
  confirmedEvents: number;
  /** 진행중 이벤트 수 */
  activeEvents: number;
  /** 마감된 이벤트 수 */
  closedEvents: number;
  /** 확정률 (0-100%) */
  confirmedRate: number;
  /** 최근 5개 이벤트 */
  recentEvents: Tables<"events">[];
}

/**
 * 모든 이벤트를 조회합니다. (관리자 전용)
 *
 * 참여자 수와 주최자 프로필 정보를 함께 조회합니다.
 * layout.tsx의 Admin 권한 검증을 통과한 경우에만 호출됩니다.
 *
 * @returns 이벤트 목록 (참여자 수, 주최자 정보 포함)
 * @throws 조회 실패 시 Error
 */
export async function getAllEvents(): Promise<AdminEvent[]> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  // 이벤트 + 참여자 수를 한 번에 조회
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error(`이벤트 목록 조회에 실패했습니다: ${eventsError.message}`);
  }

  if (!events || events.length === 0) {
    return [];
  }

  // 참여자 수를 이벤트 ID별로 조회
  const eventIds = events.map((e) => e.id);

  const { data: participantCounts, error: countError } = await supabase
    .from("participants")
    .select("event_id")
    .in("event_id", eventIds);

  if (countError) {
    throw new Error(`참여자 수 조회에 실패했습니다: ${countError.message}`);
  }

  // 이벤트별 참여자 수 집계
  const countMap = new Map<string, number>();
  for (const row of participantCounts ?? []) {
    countMap.set(row.event_id, (countMap.get(row.event_id) ?? 0) + 1);
  }

  // 주최자 프로필 조회
  const hostIds = [...new Set(events.map((e) => e.host_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", hostIds);

  if (profileError) {
    throw new Error(
      `주최자 프로필 조회에 실패했습니다: ${profileError.message}`,
    );
  }

  // 프로필 맵 생성 (host_id -> profile)
  const profileMap = new Map<
    string,
    { email: string; full_name: string | null }
  >();
  for (const profile of profiles ?? []) {
    profileMap.set(profile.id, {
      email: profile.email,
      full_name: profile.full_name,
    });
  }

  // 결과 병합
  return events.map((event) => ({
    ...event,
    participants_count: countMap.get(event.id) ?? 0,
    host_email: profileMap.get(event.host_id)?.email ?? null,
    host_name: profileMap.get(event.host_id)?.full_name ?? null,
  }));
}

/**
 * 모든 사용자 프로필을 조회합니다. (관리자 전용)
 *
 * 생성/참여 이벤트 수 통계와 함께 조회합니다.
 * layout.tsx의 Admin 권한 검증을 통과한 경우에만 호출됩니다.
 *
 * @returns 사용자 목록 (이벤트 통계 포함)
 * @throws 조회 실패 시 Error
 */
export async function getAllProfiles(): Promise<AdminProfile[]> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  // 전체 프로필 조회
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profileError) {
    throw new Error(`사용자 목록 조회에 실패했습니다: ${profileError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const profileIds = profiles.map((p) => p.id);

  // 사용자별 생성 이벤트 수 조회
  const { data: createdEvents, error: createdError } = await supabase
    .from("events")
    .select("host_id")
    .in("host_id", profileIds);

  if (createdError) {
    throw new Error(
      `생성 이벤트 수 조회에 실패했습니다: ${createdError.message}`,
    );
  }

  // 사용자별 생성 이벤트 수 집계
  const createdCountMap = new Map<string, number>();
  for (const row of createdEvents ?? []) {
    createdCountMap.set(
      row.host_id,
      (createdCountMap.get(row.host_id) ?? 0) + 1,
    );
  }

  // 사용자별 참여 이벤트 수 조회 (user_id로 participants 테이블에서)
  const { data: participatedEvents, error: participatedError } = await supabase
    .from("participants")
    .select("user_id")
    .in("user_id", profileIds)
    .not("user_id", "is", null);

  if (participatedError) {
    throw new Error(
      `참여 이벤트 수 조회에 실패했습니다: ${participatedError.message}`,
    );
  }

  // 사용자별 참여 이벤트 수 집계
  const participatedCountMap = new Map<string, number>();
  for (const row of participatedEvents ?? []) {
    if (row.user_id) {
      participatedCountMap.set(
        row.user_id,
        (participatedCountMap.get(row.user_id) ?? 0) + 1,
      );
    }
  }

  // 결과 병합
  return profiles.map((profile) => ({
    ...profile,
    created_events_count: createdCountMap.get(profile.id) ?? 0,
    participated_events_count: participatedCountMap.get(profile.id) ?? 0,
  }));
}

/**
 * 전체 통계 데이터를 조회합니다. (관리자 전용)
 *
 * 이벤트 상태별 분포, 사용자 수, 최근 이벤트 목록을 포함합니다.
 * layout.tsx의 Admin 권한 검증을 통과한 경우에만 호출됩니다.
 *
 * @returns 전체 통계 데이터
 * @throws 조회 실패 시 Error
 */
export async function getEventStats(): Promise<AdminStats> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  // 전체 이벤트 조회 (상태별 집계를 위해)
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, status, created_at, title, deadline")
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error(`이벤트 통계 조회에 실패했습니다: ${eventsError.message}`);
  }

  // 전체 사용자 수 조회
  const { count: totalUsers, error: usersError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (usersError) {
    throw new Error(`사용자 통계 조회에 실패했습니다: ${usersError.message}`);
  }

  const allEvents = events ?? [];
  const totalEvents = allEvents.length;
  const confirmedEvents = allEvents.filter(
    (e) => e.status === "confirmed",
  ).length;
  const activeEvents = allEvents.filter((e) => e.status === "active").length;
  const closedEvents = allEvents.filter((e) => e.status === "closed").length;
  const confirmedRate =
    totalEvents > 0 ? Math.round((confirmedEvents / totalEvents) * 100) : 0;

  // 최근 5개 이벤트 (전체 필드 조회)
  const { data: recentEventsData, error: recentError } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentError) {
    throw new Error(`최근 이벤트 조회에 실패했습니다: ${recentError.message}`);
  }

  return {
    totalEvents,
    totalUsers: totalUsers ?? 0,
    confirmedEvents,
    activeEvents,
    closedEvents,
    confirmedRate,
    recentEvents: recentEventsData ?? [],
  };
}
