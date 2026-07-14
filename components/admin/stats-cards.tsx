"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AdminStats } from "@/lib/services/server/admin.service";

type StatsCardsProps = {
  stats: AdminStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
  const {
    totalEvents,
    totalUsers,
    confirmedEvents,
    activeEvents,
    closedEvents,
    confirmedRate,
  } = stats;

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 이벤트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-muted-foreground text-xs">모든 이벤트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-muted-foreground text-xs">가입한 사용자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">확정률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedRate}%</div>
            <p className="text-muted-foreground text-xs">
              {confirmedEvents}개 확정
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
            <p className="text-muted-foreground text-xs">현재 진행 이벤트</p>
          </CardContent>
        </Card>
      </div>

      {/* 상태별 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>상태별 이벤트 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">진행중</p>
                <p className="text-muted-foreground text-xs">
                  {activeEvents}개
                </p>
              </div>
              <div className="bg-muted mx-4 h-2 flex-1 rounded">
                <div
                  className="h-full rounded bg-blue-600"
                  style={{
                    width: `${totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">마감</p>
                <p className="text-muted-foreground text-xs">
                  {closedEvents}개
                </p>
              </div>
              <div className="bg-muted mx-4 h-2 flex-1 rounded">
                <div
                  className="h-full rounded bg-gray-400"
                  style={{
                    width: `${totalEvents > 0 ? (closedEvents / totalEvents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">확정</p>
                <p className="text-muted-foreground text-xs">
                  {confirmedEvents}개
                </p>
              </div>
              <div className="bg-muted mx-4 h-2 flex-1 rounded">
                <div
                  className="h-full rounded bg-green-600"
                  style={{
                    width: `${totalEvents > 0 ? (confirmedEvents / totalEvents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
