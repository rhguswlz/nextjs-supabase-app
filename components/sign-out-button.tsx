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
      await signOut();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "로그아웃 실패";
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
