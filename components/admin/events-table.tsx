"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AdminEvent } from "@/lib/services/server/admin.service";
import { STATUS_LABEL, STATUS_CLASS } from "@/lib/constants/event-status";

type EventsTableProps = {
  events: AdminEvent[];
};

export function EventsTable({ events }: EventsTableProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "closed" | "confirmed"
  >("all");

  const filteredEvents =
    statusFilter === "all"
      ? events
      : events.filter((event) => event.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* 상태 필터 */}
      <div className="flex gap-2">
        {["all", "active", "closed", "confirmed"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() =>
              setStatusFilter(
                status as "all" | "active" | "closed" | "confirmed",
              )
            }
            size="sm"
          >
            {status === "all"
              ? "전체"
              : status === "active"
                ? "진행중"
                : status === "closed"
                  ? "마감"
                  : "확정"}
          </Button>
        ))}
      </div>

      {/* 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>
            이벤트 목록 ({filteredEvents.length}/{events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              이벤트가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>주최자</TableHead>
                    <TableHead className="text-center">후보 날짜</TableHead>
                    <TableHead className="text-center">참여자</TableHead>
                    <TableHead>마감일</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="max-w-xs truncate font-medium">
                        {event.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {/* 주최자 이름 (없으면 이메일 표시) */}
                          <span className="text-sm font-medium">
                            {event.host_name ??
                              event.host_email ??
                              "알 수 없음"}
                          </span>
                          {event.host_name && event.host_email && (
                            <span className="text-muted-foreground text-xs">
                              {event.host_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {event.candidate_dates?.length ?? 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {event.participants_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.deadline
                          ? new Date(event.deadline).toLocaleDateString("ko-KR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-3 py-1 text-sm font-medium ${STATUS_CLASS[event.status]}`}
                        >
                          {STATUS_LABEL[event.status] ?? event.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
