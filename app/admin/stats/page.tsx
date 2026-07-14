import { Suspense } from "react";
import { getEventStats } from "@/lib/services/server/admin.service";
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

async function StatsContent() {
  // Supabase에서 실제 통계 데이터 조회
  const stats = await getEventStats();

  return (
    <>
      <StatsCards stats={stats} />

      {/* 최근 이벤트 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 이벤트 5개</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">이벤트가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-muted-foreground text-xs">
                      마감:{" "}
                      {event.deadline
                        ? new Date(event.deadline).toLocaleDateString("ko-KR")
                        : "-"}
                    </p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-sm font-medium ${STATUS_CLASS[event.status] ?? ""}`}
                  >
                    {STATUS_LABEL[event.status] ?? event.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">통계 분석</h2>
        <p className="text-muted-foreground">서비스 전체 통계 및 분석 현황</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
