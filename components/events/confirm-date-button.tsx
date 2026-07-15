"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { confirmEventDate } from "@/app/events/actions";

interface Props {
  eventId: string;
  candidateDates: string[];
  isConfirmed: boolean;
}

export function ConfirmDateButton({
  eventId,
  candidateDates,
  isConfirmed,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (isConfirmed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <div className="text-4xl">✅</div>
          <p className="text-center font-medium text-green-700 dark:text-green-300">
            이미 날짜가 확정되었습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleConfirm = async (date: string) => {
    setIsLoading(true);
    const result = await confirmEventDate(eventId, date);

    if (result.success) {
      toast.success(`${date}로 날짜가 확정되었습니다!`);
      setSelectedDate("");
    } else {
      toast.error(result.error || "날짜 확정에 실패했습니다.");
    }

    setIsLoading(false);
  };

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📌</span>
          <span>날짜 확정</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          후보 날짜 중 최종 날짜를 선택하여 확정해주세요.
        </p>
        <div className="flex flex-wrap gap-2">
          {candidateDates.map((date) => (
            <Button
              key={date}
              variant={selectedDate === date ? "default" : "outline"}
              onClick={() => setSelectedDate(date)}
              disabled={isLoading}
              className="w-auto"
            >
              {date}
            </Button>
          ))}
        </div>
        {selectedDate && (
          <Button
            onClick={() => handleConfirm(selectedDate)}
            disabled={isLoading || !selectedDate}
            className="w-full"
            size="lg"
          >
            {isLoading ? "확정 중..." : `${selectedDate} 확정`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
