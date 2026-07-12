"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type MockUser } from "@/lib/mock/users";
import { type MockEvent } from "@/lib/mock/types";
import { getMockParticipantsByEventId } from "@/lib/mock/participants";

type UsersTableProps = {
  users: MockUser[];
  events: MockEvent[];
};

export function UsersTable({ users, events }: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 목록 ({users.length}명)</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            사용자가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-center">생성 이벤트</TableHead>
                  <TableHead className="text-center">참여 이벤트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  // 사용자가 생성한 이벤트 수
                  const createdEvents = events.filter(
                    (e) => e.ownerId === user.id,
                  ).length;

                  // 사용자가 참여한 이벤트 수
                  let participatedEvents = 0;
                  events.forEach((event) => {
                    const participants = getMockParticipantsByEventId(event.id);
                    const isParticipant = participants.some(
                      (p) => p.name === user.name,
                    );
                    if (isParticipant) participatedEvents++;
                  });

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {createdEvents}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                          {participatedEvents}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
