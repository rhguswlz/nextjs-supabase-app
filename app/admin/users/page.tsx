import { Suspense } from "react";
import { getMockUsers } from "@/lib/mock/users";
import { getMockEvents } from "@/lib/mock/events";
import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function UsersTableSkeleton() {
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

export default function AdminUsersPage() {
  const users = getMockUsers();
  const events = getMockEvents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
        <p className="text-muted-foreground">사용자 목록 및 활동 통계</p>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable users={users} events={events} />
      </Suspense>
    </div>
  );
}
