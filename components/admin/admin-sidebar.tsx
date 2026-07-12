"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Users, Calendar, Home } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/admin/stats",
      label: "통계 분석",
      icon: BarChart3,
    },
    {
      href: "/admin/events",
      label: "이벤트 관리",
      icon: Calendar,
    },
    {
      href: "/admin/users",
      label: "사용자 관리",
      icon: Users,
    },
  ];

  return (
    <aside className="hidden w-56 flex-col border-r border-border bg-background md:flex">
      {/* 로고 */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Home className="h-5 w-5" />
          <span>대시보드</span>
        </Link>
      </div>

      <Separator />

      {/* 메뉴 */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            variant={pathname === href ? "default" : "ghost"}
            asChild
            className="w-full justify-start"
          >
            <Link href={href}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>

      <Separator />
    </aside>
  );
}
