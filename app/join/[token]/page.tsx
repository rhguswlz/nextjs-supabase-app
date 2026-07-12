import Link from "next/link";
import { Suspense } from "react";
import { getMockEventByToken } from "@/lib/mock";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuestJoinForm } from "@/components/events/guest-join-form";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ token: string }>;
}

async function JoinContent({ params }: Props) {
  const { token } = await params;
  const event = getMockEventByToken(token);

  if (!event) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h1 className="mb-2 text-xl font-bold">
          초대 링크가 유효하지 않습니다
        </h1>
        <p className="mb-6 text-muted-foreground">
          링크가 만료되었거나 존재하지 않는 이벤트입니다.
        </p>
        <Button asChild variant="outline">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">모임 참여하기</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>📅 후보 날짜 {event.candidateDates.length}개</span>
          <span>⏰ 마감 {event.deadline}</span>
          {event.location && <span>📍 {event.location}</span>}
        </CardContent>
      </Card>

      <GuestJoinForm candidateDates={event.candidateDates} />
    </div>
  );
}

export default function JoinPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <Skeleton className="mx-auto mt-10 h-[600px] max-w-lg rounded-xl" />
      }
    >
      <JoinContent params={params} />
    </Suspense>
  );
}
