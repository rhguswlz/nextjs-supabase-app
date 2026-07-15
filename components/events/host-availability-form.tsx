"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateHostAvailability } from "@/app/events/actions";

interface Props {
  eventId: string;
  candidateDates: string[];
  currentDates?: string[];
  isEventClosed?: boolean;
  eventStatus?: string;
}

export function HostAvailabilityForm({
  eventId,
  candidateDates,
  currentDates = [],
  isEventClosed = false,
  eventStatus = "active",
}: Props) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 초기 날짜 설정
  useEffect(() => {
    const initialDates = currentDates.map((d) => new Date(d + "T00:00:00"));
    setSelectedDates(initialDates);
  }, [currentDates]);

  const allowedDates = candidateDates.map((d) => new Date(d + "T00:00:00"));

  const toLocalDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isDisabled = (date: Date) => {
    return !candidateDates.includes(toLocalDateKey(date));
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      toast.error("가능한 날짜를 1개 이상 선택해주세요");
      return;
    }

    setIsLoading(true);
    const dates = selectedDates.map(toLocalDateKey);

    const result = await updateHostAvailability(eventId, dates);

    if (result.success) {
      setSubmitted(true);
      toast.success("가용 날짜가 저장되었습니다!");
      setTimeout(() => setSubmitted(false), 2000);
    } else {
      toast.error(result.error || "가용 날짜 저장에 실패했습니다.");
    }

    setIsLoading(false);
  };

  if (isEventClosed || eventStatus === "closed") {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <div className="text-4xl">🔒</div>
          <p className="text-center font-medium text-red-700 dark:text-red-300">
            마감된 이벤트입니다.
          </p>
          <p className="text-muted-foreground text-center text-sm">
            응답 마감일이 지났습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <div className="text-4xl">✅</div>
          <p className="text-center font-medium">가용 날짜가 저장되었습니다!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 달력 — 후보 날짜만 선택 가능 */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>주최자 가용 날짜 선택</CardTitle>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-3">
          <p
            className="text-muted-foreground text-center text-sm"
            id="calendar-hint"
          >
            후보 날짜 중 참여 가능한 날짜를 선택해주세요 (복수 선택 가능)
          </p>
          <div className="flex w-full justify-center overflow-x-auto">
            <div>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates ?? [])}
                disabled={isDisabled}
                modifiers={{ candidate: allowedDates }}
                modifiersClassNames={{
                  candidate: "ring-1 ring-primary/40 rounded-md",
                }}
                className="mx-auto rounded-md border [--cell-size:2.5rem] sm:[--cell-size:3.5rem] md:[--cell-size:4rem]"
                aria-describedby="calendar-hint"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-center text-sm font-medium" aria-live="polite">
              {selectedDates.length > 0
                ? `${selectedDates.length}개 날짜 선택됨`
                : "날짜를 선택해주세요"}
            </p>
            {selectedDates.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDates([])}
                className="text-primary hover:text-primary/80 text-xs font-medium underline"
              >
                모두 해제
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={handleSubmit}
        className="w-full"
        disabled={isLoading}
        aria-label="가용 날짜 저장하기"
      >
        {isLoading ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
