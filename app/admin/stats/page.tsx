import { Suspense } from "react";
import { getMockEvents } from "@/lib/mock/events";
import { getMockUsers } from "@/lib/mock/users";
import { StatsCards } from "@/components/admin/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABEL, STATUS_CLASS } from "@/lib/constants/event-status";
import { Skeleton } from "@/components/ui/skeleton";

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminStatsPage() {
  const events = getMockEvents();
  const users = getMockUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">통계 분석</h2>
        <p className="text-muted-foreground">서비스 전체 통계 및 분석 현황</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards events={events} users={users} />
      </Suspense>

      {/* 최근 이벤트 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 이벤트 5개</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">이벤트가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      마감:{" "}
                      {new Date(event.deadline).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-sm font-medium text-white ${STATUS_CLASS[event.status]}`}
                  >
                    {STATUS_LABEL[event.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
