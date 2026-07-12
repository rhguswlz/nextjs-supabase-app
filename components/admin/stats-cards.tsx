"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type MockEvent } from "@/lib/mock/types";
import { type MockUser } from "@/lib/mock/users";

type StatsCardsProps = {
  events: MockEvent[];
  users: MockUser[];
};

export function StatsCards({ events, users }: StatsCardsProps) {
  // 통계 계산
  const totalEvents = events.length;
  const totalUsers = users.length;
  const confirmedEvents = events.filter((e) => e.status === "confirmed").length;
  const confirmedRate =
    totalEvents > 0 ? Math.round((confirmedEvents / totalEvents) * 100) : 0;

  // 상태별 분포
  const statusDistribution = {
    active: events.filter((e) => e.status === "active").length,
    closed: events.filter((e) => e.status === "closed").length,
    confirmed: confirmedEvents,
  };

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
            <p className="text-xs text-muted-foreground">모든 이벤트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">가입한 사용자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">확정률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedRate}%</div>
            <p className="text-xs text-muted-foreground">
              {confirmedEvents}개 확정
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusDistribution.active}
            </div>
            <p className="text-xs text-muted-foreground">현재 진행 이벤트</p>
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
                <p className="text-xs text-muted-foreground">
                  {statusDistribution.active}개
                </p>
              </div>
              <div className="mx-4 h-2 flex-1 rounded bg-muted">
                <div
                  className="h-full rounded bg-blue-600"
                  style={{
                    width: `${totalEvents > 0 ? (statusDistribution.active / totalEvents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">마감</p>
                <p className="text-xs text-muted-foreground">
                  {statusDistribution.closed}개
                </p>
              </div>
              <div className="mx-4 h-2 flex-1 rounded bg-muted">
                <div
                  className="h-full rounded bg-gray-400"
                  style={{
                    width: `${totalEvents > 0 ? (statusDistribution.closed / totalEvents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">확정</p>
                <p className="text-xs text-muted-foreground">
                  {statusDistribution.confirmed}개
                </p>
              </div>
              <div className="mx-4 h-2 flex-1 rounded bg-muted">
                <div
                  className="h-full rounded bg-green-600"
                  style={{
                    width: `${totalEvents > 0 ? (statusDistribution.confirmed / totalEvents) * 100 : 0}%`,
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
