"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { toast } from "sonner";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      toast.loading("로그아웃 중...");
      await signOut();
      // redirect는 throw를 하므로 여기에 도달하지 않음
    } catch (error) {
      // redirect error는 정상 흐름이므로 무시
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "로그아웃에 실패했습니다. 다시 시도해주세요.";
      console.error("로그아웃 실패:", error);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="로그아웃"
    >
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
