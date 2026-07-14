"use client";

/**
 * 이벤트 상세 클라이언트 컴포넌트
 *
 * Supabase Realtime을 통해 히트맵과 참여자 목록을 실시간으로 업데이트합니다.
 * 서버에서 초기 데이터를 받아 즉시 렌더링하고,
 * 클라이언트 마운트 후 Realtime 구독으로 데이터를 동기화합니다.
 */

import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";
import { HeatmapGrid } from "@/components/heatmap/heatmap-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AggregatedAvailability } from "@/lib/utils/availability-aggregation";
import type { ParticipantRow } from "@/lib/utils/availability-aggregation";

interface Props {
  /** 이벤트 ID */
  eventId: string;
  /** 이벤트의 후보 날짜 배열 */
  candidateDates: string[];
  /** 서버에서 전달받은 초기 집계 데이터 */
  initialAggregation: AggregatedAvailability[];
  /** 서버에서 전달받은 초기 참여자 목록 */
  initialParticipants: ParticipantRow[];
}

/**
 * Realtime 연결 상태 배지 컴포넌트
 *
 * 연결 상태에 따라 색상과 텍스트를 다르게 표시합니다.
 */
function ConnectionBadge({
  isConnected,
  lastUpdatedAt,
}: {
  isConnected: boolean;
  lastUpdatedAt: Date | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isConnected ? "default" : "secondary"}
        className={
          isConnected
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-600"
        }
        data-testid="connection-badge"
      >
        <span
          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
            isConnected ? "animate-pulse bg-white" : "bg-gray-500"
          }`}
        />
        {isConnected ? "실시간 연결됨" : "연결 중..."}
      </Badge>
      {lastUpdatedAt && (
        <span
          className="text-muted-foreground text-xs"
          data-testid="last-updated"
        >
          마지막 업데이트:{" "}
          {lastUpdatedAt.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

/**
 * 이벤트 히트맵과 참여자 목록을 실시간으로 표시하는 클라이언트 컴포넌트
 *
 * 서버에서 초기값을 받아 즉시 렌더링하고,
 * useRealtimeAvailability 훅을 통해 Realtime 변경사항을 반영합니다.
 */
export function EventDetailClient({
  eventId,
  candidateDates,
  initialAggregation,
  initialParticipants,
}: Props) {
  const { aggregation, participants, isLoading, isConnected, lastUpdatedAt } =
    useRealtimeAvailability({
      eventId,
      initialAggregation,
      initialParticipants,
    });

  return (
    <>
      {/* 히트맵 카드 */}
      <Card className="mb-6" data-testid="heatmap-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>날짜별 가용성 히트맵</CardTitle>
            <ConnectionBadge
              isConnected={isConnected}
              lastUpdatedAt={lastUpdatedAt}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // 초기 데이터 로딩 중에는 초기값 표시 (Skeleton 대신 실제 데이터)
            <p className="text-muted-foreground text-sm">데이터 동기화 중...</p>
          ) : aggregation.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-testid="no-aggregation-message"
            >
              아직 응답한 참여자가 없습니다.
            </p>
          ) : (
            <HeatmapGrid
              candidateDates={candidateDates}
              aggregation={aggregation}
              totalParticipants={participants.length}
            />
          )}
        </CardContent>
      </Card>

      {/* 참여자 목록 카드 */}
      <Card data-testid="participants-card">
        <CardHeader>
          <CardTitle data-testid="participants-count">
            참여자 목록 ({participants.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-testid="no-participants-message"
            >
              아직 참여자가 없습니다.
            </p>
          ) : (
            <ul className="divide-y" data-testid="participants-list">
              {participants.map((p) => {
                // 해당 참여자가 가능한 날짜 수 계산
                const availableDatesCount = aggregation.filter((a) =>
                  a.participants.includes(p.guest_name),
                ).length;

                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 text-sm"
                    data-testid={`participant-item-${p.guest_name}`}
                  >
                    <span className="font-medium">{p.guest_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {availableDatesCount}개 날짜 가능
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
