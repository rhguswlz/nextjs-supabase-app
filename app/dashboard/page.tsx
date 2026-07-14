import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserEvents } from "@/lib/services/server/events.service";
import { getParticipantsByEventId } from "@/lib/services/server/participants.service";
import type { Event } from "@/lib/services/server/events.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_CLASS } from "@/lib/constants/event-status";

async function EventList({ events }: { events: Event[] }) {
  return (
    <>
      {events.length === 0 ? (
        <div
          role="region"
          aria-label="이벤트 없음"
          className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center"
        >
          <div className="text-4xl" aria-hidden="true">
            📭
          </div>
          <div>
            <p className="font-medium">아직 만든 모임이 없어요</p>
            <p className="text-muted-foreground mt-1 text-sm">
              첫 번째 모임을 만들어 날짜를 정해보세요!
            </p>
          </div>
          <Button asChild>
            <Link
              href="/events/new"
              aria-label="첫 이벤트 만들기 페이지로 이동"
            >
              첫 이벤트 만들기
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4" aria-label="이벤트 목록">
          {await Promise.all(
            events.map(async (event) => {
              const participants = await getParticipantsByEventId(event.id);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    aria-label={`${event.title} 이벤트 보기 — 상태: ${STATUS_LABEL[event.status]}`}
                  >
                    <Card className="hover:border-primary/30 cursor-pointer transition-all hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-snug">
                            {event.title}
                          </CardTitle>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded-md border px-3 py-1 text-sm font-semibold whitespace-nowrap",
                              STATUS_CLASS[event.status] ||
                                "border-gray-200 bg-gray-100 text-gray-700",
                            )}
                            aria-label={`상태: ${STATUS_LABEL[event.status] || "알 수 없음"}`}
                          >
                            {STATUS_LABEL[event.status] || "상태 미정"}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span>
                            📅 후보 {event.candidate_dates?.length || 0}일
                          </span>
                          <span>👥 참여자 {participants.length}명</span>
                          <span>⏰ 마감 {event.deadline}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                        {event.confirmed_date && (
                          <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                            ✅ 확정일: {event.confirmed_date}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData.user) {
    throw new Error("인증 정보를 가져올 수 없습니다.");
  }

  const events = await getUserEvents(userData.user.id);
  const userEmail = userData.user.email || "사용자";

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 모임 목록</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {userEmail} • 총 {events.length}개의 모임
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link
              href="/events/new"
              aria-label="새 이벤트 만들기 페이지로 이동"
            >
              + 새 이벤트 만들기
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <EventList events={events} />
      </Suspense>
    </main>
  );
}
