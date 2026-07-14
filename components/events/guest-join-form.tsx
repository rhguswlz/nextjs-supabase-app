"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useGuestSession } from "@/lib/hooks/useGuestSession";
import { createGuestParticipant } from "@/app/events/actions";

interface Props {
  candidateDates: string[];
  eventId: string;
}

export function GuestJoinForm({ candidateDates, eventId }: Props) {
  const { guestToken, setGuestToken } = useGuestSession();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [submitted, setSubmitted] = useState(false);

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
    if (!name.trim()) {
      setNameError("이름을 입력해주세요");
      return;
    }
    if (selectedDates.length === 0) {
      toast.error("가능한 날짜를 1개 이상 선택해주세요");
      return;
    }

    setNameError("");

    const dates = selectedDates.map(toLocalDateKey);
    const result = await createGuestParticipant(
      eventId,
      name,
      dates,
      guestToken || undefined,
    );

    if (result.success && result.token) {
      setGuestToken(result.token);
      setSubmitted(true);
      toast.success(`${name}님의 가용 날짜가 등록되었습니다!`);
    } else {
      toast.error(result.error || "참여 등록에 실패했습니다.");
    }
  };

  if (submitted) {
    return (
      <Card className="text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="text-5xl" aria-hidden="true">
            🎉
          </div>
          <h2 className="text-xl font-bold">참여 완료!</h2>
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">{name}</span>님의 가용
            날짜가 등록되었습니다.
          </p>
          <p className="text-muted-foreground text-sm">
            선택한 날짜: {selectedDates.map(toLocalDateKey).join(", ")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 이름 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>참여자 이름</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="guest-name">이름 *</Label>
          <Input
            id="guest-name"
            placeholder="ex. 홍길동"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            aria-describedby={nameError ? "name-error" : undefined}
            aria-invalid={!!nameError}
          />
          {nameError && (
            <p
              id="name-error"
              className="text-destructive text-xs"
              role="alert"
            >
              {nameError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 달력 — 후보 날짜만 선택 가능 */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>가능한 날짜 선택</CardTitle>
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
                className="mx-auto rounded-md border [--cell-size:4.5rem]"
                aria-describedby="calendar-hint"
              />
            </div>
          </div>
          <p className="text-center text-sm font-medium" aria-live="polite">
            {selectedDates.length > 0
              ? `${selectedDates.length}개 날짜 선택됨`
              : "날짜를 선택해주세요"}
          </p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={handleSubmit}
        className="w-full"
        aria-label="가용 날짜 제출하기"
      >
        참여 완료
      </Button>
    </div>
  );
}
