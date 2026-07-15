import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/services/server/events.service";
import { getParticipantsByEventId } from "@/lib/services/server/participants.service";
import {
  getAvailabilityByEventId,
  getAvailabilityByParticipantId,
} from "@/lib/services/server/availability.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyInviteButton } from "@/components/events/copy-invite-button";
import { HostAvailabilityForm } from "@/components/events/host-availability-form";
import { EventDetailClient } from "@/components/events/event-detail-client";
import { ConfirmDateButton } from "@/components/events/confirm-date-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_CLASS } from "@/lib/constants/event-status";
import { isEventClosed } from "@/lib/utils/event-status";

interface Props {
  params: Promise<{ id: string }>;
}

async function EventDetailContent({ params }: Props) {
  const { id } = await params;

  let event;
  try {
    event = await getEventById(id);
  } catch {
    event = null;
  }

  if (!event) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h1 className="mb-2 text-xl font-bold">이벤트를 찾을 수 없습니다</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">대시보드로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const participants = await getParticipantsByEventId(id);
  const aggregation = await getAvailabilityByEventId(id);
  const bestCount = Math.max(...aggregation.map((a) => a.count), 0);
  const bestDates = aggregation.filter(
    (a) => a.count === bestCount && bestCount > 0,
  );

  // 현재 사용자가 주최자인지 확인
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isHost = userData.user?.id === event.host_id;

  // 마감일 여부 확인
  const isClosed = isEventClosed(event);

  // 주최자의 현재 가용 날짜 조회
  let hostCurrentDates: string[] = [];
  if (isHost) {
    try {
      const hostParticipant = participants.find(
        (p) => p.user_id === userData.user?.id,
      );
      if (hostParticipant) {
        hostCurrentDates = await getAvailabilityByParticipantId(
          hostParticipant.id,
        );
      }
    } catch {
      // 에러 무시
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">← 대시보드</Link>
        </Button>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
            STATUS_CLASS[event.status],
          )}
        >
          {STATUS_LABEL[event.status]}
        </span>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {event.description && <p className="w-full">{event.description}</p>}
            {event.location && <span>📍 {event.location}</span>}
            <span>📅 후보 날짜 {event.candidate_dates?.length || 0}개</span>
            <div className="flex items-center gap-2">
              <span>⏰ 마감 {event.deadline}</span>
              {isClosed && (
                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                  마감됨
                </span>
              )}
            </div>
            {event.confirmed_date && (
              <span className="font-medium text-green-600 dark:text-green-400">
                ✅ 확정일: {event.confirmed_date}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {bestDates.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">⭐ 최적 날짜</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {bestDates.map((d) => (
                <div key={d.date}>
                  <span className="font-bold">{d.date}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {d.count}명 가능
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">초대 링크</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <code className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
              /join/{event.invite_token}
            </code>
            <CopyInviteButton token={event.invite_token} />
          </CardContent>
        </Card>
      </div>

      {isHost && (
        <>
          {!event.confirmed_date && (
            <div className="mb-6">
              <ConfirmDateButton
                eventId={id}
                candidateDates={event.candidate_dates || []}
                isConfirmed={event.status === "confirmed"}
              />
            </div>
          )}

          <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👤</span>
                <span>당신의 가용 날짜</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HostAvailabilityForm
                eventId={id}
                candidateDates={event.candidate_dates || []}
                currentDates={hostCurrentDates}
                isEventClosed={isClosed}
                eventStatus={event.status}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/*
       * Realtime 구독 클라이언트 컴포넌트
       * 서버에서 조회한 초기 데이터를 props로 전달하고,
       * 클라이언트에서 Supabase Realtime 구독을 통해 실시간 업데이트를 처리합니다.
       */}
      <EventDetailClient
        eventId={id}
        candidateDates={event.candidate_dates || []}
        initialAggregation={aggregation}
        initialParticipants={participants.map((p) => ({
          id: p.id,
          guest_name: p.guest_name,
        }))}
        initialIsEventClosed={isClosed}
        initialEventStatus={event.status}
      />
    </div>
  );
}

export default function EventDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <Skeleton className="mx-auto mt-10 h-[600px] max-w-3xl rounded-xl" />
      }
    >
      <EventDetailContent params={params} />
    </Suspense>
  );
}
