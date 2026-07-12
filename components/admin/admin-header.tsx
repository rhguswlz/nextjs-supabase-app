"use client";

import { type User } from "@supabase/supabase-js";

type AdminHeaderProps = {
  title: string;
  user: User | null;
};

export function AdminHeader({ title, user }: AdminHeaderProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {user && (
          <div className="text-sm text-muted-foreground">
            로그인:{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
