"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createEvent } from "@/app/events/actions";

/* ─── Zod 스키마 ─── */
const step1Schema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(50, "50자 이내로 입력해주세요"),
  description: z.string().max(200, "200자 이내로 입력해주세요").optional(),
  location: z.string().max(100).optional(),
});

const step3Schema = z.object({
  deadline: z.string().min(1, "마감일을 선택해주세요"),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

interface FormData extends Step1Values, Step3Values {
  candidateDates: Date[];
}

/* ─── Stepper ─── */
function Stepper({ current }: { current: number }) {
  const steps = ["기본 정보", "후보 날짜", "마감일 확인"];
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/30 text-primary",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 w-12",
                  isDone ? "bg-primary/30" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export function EventCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    candidateDates: [],
  });

  /* Step 1 폼 */
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: formData.title ?? "",
      description: formData.description ?? "",
      location: formData.location ?? "",
    },
  });

  /* Step 3 폼 */
  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { deadline: formData.deadline ?? "" },
  });

  /* 단계 이동 핸들러 */
  const handleStep1Next = step1Form.handleSubmit((values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep(2);
  });

  const handleStep2Next = () => {
    if (!formData.candidateDates?.length) {
      toast.error("날짜를 1개 이상 선택해주세요");
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = step3Form.handleSubmit(async (values) => {
    setFormData((prev) => ({ ...prev, ...values }));

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const candidateDates = (formData.candidateDates || []).map((date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    });

    const result = await createEvent(
      formData.title || "",
      formData.description,
      formData.location,
      candidateDates,
      values.deadline,
    );

    if (result.success) {
      toast.success("이벤트가 생성되었습니다!");
      router.push("/dashboard");
    } else {
      toast.error(result.error || "이벤트 생성에 실패했습니다.");
    }
  });

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">새 모임 만들기</h1>
      <Stepper current={step} />

      {/* ── Step 1: 기본 정보 ── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Next} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">모임 이름 *</Label>
                <Input
                  id="title"
                  placeholder="ex. 팀 워크숍 날짜 조율"
                  {...step1Form.register("title")}
                />
                {step1Form.formState.errors.title && (
                  <p className="text-destructive text-xs">
                    {step1Form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  placeholder="모임에 대한 간단한 설명"
                  {...step1Form.register("description")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  placeholder="ex. 서울 강남구 또는 온라인"
                  {...step1Form.register("location")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                >
                  취소
                </Button>
                <Button type="submit">다음 →</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: 후보 날짜 ── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>후보 날짜 선택</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-sm" id="wizard-cal-hint">
              날짜를 클릭하여 여러 개 선택하세요
            </p>
            <div className="flex w-full justify-center overflow-x-auto">
              <div className="min-w-max">
                <Calendar
                  mode="multiple"
                  selected={formData.candidateDates}
                  onSelect={(dates) =>
                    setFormData((prev) => ({
                      ...prev,
                      candidateDates: dates ?? [],
                    }))
                  }
                  className="mx-auto rounded-md border [--cell-size:2.5rem] sm:[--cell-size:3.5rem] md:[--cell-size:4rem]"
                  aria-describedby="wizard-cal-hint"
                />
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-medium">
                선택된 날짜: {formData.candidateDates?.length ?? 0}개
              </p>
              {(formData.candidateDates?.length ?? 0) > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      candidateDates: [],
                    }))
                  }
                >
                  모두 해제
                </Button>
              )}
            </div>
            <div className="flex w-full justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← 이전
              </Button>
              <Button onClick={handleStep2Next}>다음 →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: 마감일 + 확인 ── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>마감일 설정 및 확인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep3Submit} className="flex flex-col gap-5">
              {/* 입력 내용 요약 */}
              <div className="bg-muted/50 space-y-1 rounded-lg p-4 text-sm">
                <p>
                  <span className="font-medium">모임 이름:</span>{" "}
                  {formData.title}
                </p>
                {formData.description && (
                  <p>
                    <span className="font-medium">설명:</span>{" "}
                    {formData.description}
                  </p>
                )}
                {formData.location && (
                  <p>
                    <span className="font-medium">장소:</span>{" "}
                    {formData.location}
                  </p>
                )}
                <p>
                  <span className="font-medium">
                    후보 날짜 {formData.candidateDates?.length}개:
                  </span>{" "}
                  {formData.candidateDates
                    ?.map((d) => d.toISOString().slice(0, 10))
                    .join(", ")}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deadline">참여 마감일 *</Label>
                <Input
                  id="deadline"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  {...step3Form.register("deadline")}
                />
                {step3Form.formState.errors.deadline && (
                  <p className="text-destructive text-xs">
                    {step3Form.formState.errors.deadline.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  ← 이전
                </Button>
                <Button type="submit">완료 — 대시보드로</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
