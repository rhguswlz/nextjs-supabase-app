import { Suspense } from "react";
import { EventCreateWizard } from "@/components/events/event-create-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewEventPage() {
  return (
    <Suspense
      fallback={<Skeleton className="mx-auto mt-20 h-96 max-w-lg rounded-xl" />}
    >
      <EventCreateWizard />
    </Suspense>
  );
}
