import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mt-2 h-4 w-64" />
            <div className="mt-4 flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
