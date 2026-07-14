import { Suspense } from "react";
import { getAllEvents } from "@/lib/services/server/admin.service";
import { EventsTable } from "@/components/admin/events-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EventsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function EventsContent() {
  // Supabase에서 실제 이벤트 데이터 조회
  const events = await getAllEvents();

  return <EventsTable events={events} />;
}

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">이벤트 관리</h2>
        <p className="text-muted-foreground">모든 이벤트 목록 및 상태 관리</p>
      </div>

      <Suspense fallback={<EventsTableSkeleton />}>
        <EventsContent />
      </Suspense>
    </div>
  );
}
