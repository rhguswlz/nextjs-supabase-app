import { Suspense } from "react";
import { getMockEvents } from "@/lib/mock/events";
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

export default function AdminEventsPage() {
  const events = getMockEvents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">이벤트 관리</h2>
        <p className="text-muted-foreground">모든 이벤트 목록 및 상태 관리</p>
      </div>

      <Suspense fallback={<EventsTableSkeleton />}>
        <EventsTable events={events} />
      </Suspense>
    </div>
  );
}
