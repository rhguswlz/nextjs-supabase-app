"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MockAvailabilityAggregation } from "@/lib/mock";

interface Props {
  candidateDates: string[];
  aggregation: MockAvailabilityAggregation[];
  totalParticipants: number;
}

function getIntensityClass(count: number, total: number): string {
  if (total === 0 || count === 0) return "bg-muted";
  const ratio = count / total;
  if (ratio >= 0.9) return "bg-blue-600 text-white";
  if (ratio >= 0.7) return "bg-blue-400 text-white";
  if (ratio >= 0.5) return "bg-blue-300";
  if (ratio >= 0.3) return "bg-blue-200";
  return "bg-blue-100";
}

export function HeatmapGrid({
  candidateDates,
  aggregation,
  totalParticipants,
}: Props) {
  const aggMap = new Map(aggregation.map((a) => [a.date, a]));
  const maxCount = Math.max(...aggregation.map((a) => a.count), 0);

  return (
    <TooltipProvider>
      {/* 모바일: 2열 그리드 / 태블릿 이상: 자동 줄바꿈 flex */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        {candidateDates.map((date) => {
          const agg = aggMap.get(date);
          const count = agg?.count ?? 0;
          const participants = agg?.participants ?? [];
          const isBest = count > 0 && count === maxCount;

          return (
            <Tooltip key={date}>
              <TooltipTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`${date}: ${count}명 가능${isBest ? ", 최적 날짜" : ""}`}
                  className={cn(
                    "flex cursor-default flex-col items-center rounded-lg border p-3 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:min-w-[100px]",
                    getIntensityClass(count, totalParticipants),
                    isBest && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <span className="text-xs font-medium opacity-70">
                    {date.slice(5)}
                    {isBest && " ⭐"}
                  </span>
                  <span className="mt-1 text-2xl font-bold">{count}</span>
                  <span className="text-xs opacity-70">
                    / {totalParticipants}명
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {participants.length === 0 ? (
                  <p>참여 가능자 없음</p>
                ) : (
                  <div>
                    <p className="mb-1 font-semibold">{date} 가능</p>
                    <ul className="text-xs">
                      {participants.map((name) => (
                        <li key={name}>· {name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
