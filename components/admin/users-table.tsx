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
import { Badge } from "@/components/ui/badge";
import { type AdminProfile } from "@/lib/services/server/admin.service";

type UsersTableProps = {
  users: AdminProfile[];
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 목록 ({users.length}명)</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
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
                  <TableHead className="text-center">권한</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name ?? "이름 없음"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {user.created_events_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                        {user.participated_events_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.is_admin ? (
                        <Badge variant="destructive" className="text-xs">
                          관리자
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          일반
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
