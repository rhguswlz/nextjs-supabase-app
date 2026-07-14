"use client";

/**
 * Realtime 가용성 구독 훅
 *
 * Supabase Realtime을 통해 `availability_dates`와 `participants` 테이블의
 * 변경사항을 실시간으로 구독하고, 변화 감지 시 데이터를 즉시 재집계합니다.
 *
 * 연결 상태(`isConnected`)와 마지막 업데이트 시간(`lastUpdatedAt`)도 추적하여
 * UI에서 실시간 연결 상태를 표시할 수 있도록 지원합니다.
 *
 * 주의사항:
 * - 브라우저 클라이언트만 사용합니다 (SSR에서 호출 금지)
 * - 컴포넌트 언마운트 시 자동으로 구독을 해제합니다
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  aggregateAvailability,
  type AggregatedAvailability,
  type AvailabilityDateRow,
  type ParticipantRow,
} from "@/lib/utils/availability-aggregation";

/** useRealtimeAvailability 훅의 반환 타입 */
export interface UseRealtimeAvailabilityResult {
  /** 날짜별 집계 결과 */
  aggregation: AggregatedAvailability[];
  /** 참여자 목록 */
  participants: ParticipantRow[];
  /** 데이터 로딩 중 여부 */
  isLoading: boolean;
  /** Realtime 채널 연결 상태 */
  isConnected: boolean;
  /** 마지막 데이터 업데이트 시각 (초기에는 null) */
  lastUpdatedAt: Date | null;
}

/** useRealtimeAvailability 훅의 초기화 옵션 */
export interface UseRealtimeAvailabilityOptions {
  /** 구독할 이벤트 ID */
  eventId: string;
  /** 초기 집계 데이터 (서버에서 전달받은 초기값, SSR 데이터) */
  initialAggregation: AggregatedAvailability[];
  /** 초기 참여자 목록 (서버에서 전달받은 초기값) */
  initialParticipants: ParticipantRow[];
}

/**
 * Supabase Realtime 구독을 통해 이벤트 가용성을 실시간으로 추적하는 훅
 *
 * @param options - 이벤트 ID와 초기 데이터
 * @returns 실시간 집계 데이터, 참여자 목록, 연결 상태
 */
export function useRealtimeAvailability({
  eventId,
  initialAggregation,
  initialParticipants,
}: UseRealtimeAvailabilityOptions): UseRealtimeAvailabilityResult {
  // 클라이언트 사이드에서 실제 데이터를 가져올 때까지 초기값 사용
  const [aggregation, setAggregation] =
    useState<AggregatedAvailability[]>(initialAggregation);
  const [participants, setParticipants] =
    useState<ParticipantRow[]>(initialParticipants);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // 현재 참여자 데이터를 클로저 안에서 최신 값으로 참조하기 위한 ref
  const participantsRef = useRef<ParticipantRow[]>(initialParticipants);

  // 참여자 state 변경 시 ref도 동기화
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  /**
   * 이벤트의 전체 가용성 데이터를 Supabase에서 재조회합니다.
   * Realtime 이벤트 수신 시 호출됩니다.
   */
  const refetchAvailability = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("availability_dates")
      .select("date, participant_id")
      .eq("event_id", eventId)
      .order("date", { ascending: true });

    if (error) {
      console.error("[useRealtimeAvailability] 가용성 조회 실패:", error);
      return;
    }

    // 최신 참여자 ref를 기반으로 집계 재계산
    const newAggregation = aggregateAvailability(
      (data as AvailabilityDateRow[]) ?? [],
      participantsRef.current,
    );

    setAggregation(newAggregation);
    setLastUpdatedAt(new Date());
  }, [eventId]);

  /**
   * 이벤트의 전체 참여자 데이터를 Supabase에서 재조회합니다.
   * 참여자 변경 Realtime 이벤트 수신 시 호출됩니다.
   */
  const refetchParticipants = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("participants")
      .select("id, guest_name")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[useRealtimeAvailability] 참여자 조회 실패:", error);
      return;
    }

    const newParticipants = (data as ParticipantRow[]) ?? [];
    setParticipants(newParticipants);
    participantsRef.current = newParticipants;

    // 참여자 변경 후 가용성도 재집계
    await refetchAvailability();
  }, [eventId, refetchAvailability]);

  useEffect(() => {
    const supabase = createClient();

    // 초기 데이터 동기화: 클라이언트 마운트 시 서버 초기값과 실제 DB 상태 동기화
    const initialize = async () => {
      setIsLoading(true);
      await refetchParticipants();
      setIsLoading(false);
    };

    initialize();

    /**
     * Realtime 채널 구독 설정
     *
     * 단일 채널에서 두 테이블을 동시에 구독합니다:
     * - availability_dates: event_id 필터링으로 해당 이벤트의 변경만 구독
     * - participants: event_id 필터링으로 해당 이벤트의 변경만 구독
     */
    const channel = supabase
      .channel(`event-realtime-${eventId}`)
      // availability_dates 테이블 변경 구독
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability_dates",
          filter: `event_id=eq.${eventId}`,
        },
        async (_payload) => {
          await refetchAvailability();
        },
      )
      // participants 테이블 변경 구독
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `event_id=eq.${eventId}`,
        },
        async (_payload) => {
          await refetchParticipants();
        },
      )
      // 채널 구독 상태 변경 핸들러
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    // 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, refetchAvailability, refetchParticipants]);

  return {
    aggregation,
    participants,
    isLoading,
    isConnected,
    lastUpdatedAt,
  };
}
