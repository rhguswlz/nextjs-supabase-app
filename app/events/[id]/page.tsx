import Link from "next/link";
import { Suspense } from "react";
import { getEventById } from "@/lib/services/server/events.service";
import { getParticipantsByEventId } from "@/lib/services/server/participants.service";
import { getAvailabilityByEventId } from "@/lib/services/server/availability.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeatmapGrid } from "@/components/heatmap/heatmap-grid";
import { CopyInviteButton } from "@/components/events/copy-invite-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_CLASS } from "@/lib/constants/event-status";

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
            <span>⏰ 마감 {event.deadline}</span>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>날짜별 가용성 히트맵</CardTitle>
        </CardHeader>
        <CardContent>
          {aggregation.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 응답한 참여자가 없습니다.
            </p>
          ) : (
            <HeatmapGrid
              candidateDates={event.candidate_dates || []}
              aggregation={aggregation}
              totalParticipants={participants.length}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>참여자 목록 ({participants.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 참여자가 없습니다.
            </p>
          ) : (
            <ul className="divide-y">
              {participants.map((p) => {
                const availableDatesCount = aggregation.filter((a) =>
                  a.participants.includes(p.guest_name),
                ).length;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 text-sm"
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
